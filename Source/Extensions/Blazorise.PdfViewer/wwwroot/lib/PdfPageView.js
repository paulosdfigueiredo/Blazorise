import { DEFAULT_SCALE, RenderingStates, RendererType, TextLayerMode } from "./base.js";
import { EventBus } from "./event-utils.js";
import { OutputScale, approximateFraction, roundToDivide } from "./ui-utils.js";

export class PdfPageView {
    constructor(options) {
        const container = options.container;
        const defaultViewport = options.defaultViewport;

        this.id = options.id;
        this.renderingId = "page" + this.id;

        this.pdfPage = null;
        this.pageLabel = null;
        this.rotation = 0;
        this.scale = options.scale || DEFAULT_SCALE;
        this.viewport = defaultViewport;
        this.pdfPageRotate = defaultViewport.rotation;

        this.renderingQueue = options.renderingQueue;
        this.textLayerFactory = options.textLayerFactory;
        this.renderer = options.renderer || RendererType.CANVAS;

        this.paintTask = null;
        this.paintedViewportMap = new WeakMap();
        this.renderingState = RenderingStates.INITIAL;
        this._isStandalone = !this.renderingQueue?.hasViewer();

        this.annotationLayer = null;
        this.textLayer = null;

        const div = document.createElement('div');
        div.dataset.pageNumber = this.id;
        div.dataset.loaded = false;
        div.classList.add("b-pdf-page");
        this.div = div;

        container?.appendChild(pageElement);
    }

    setPdfPage(pdfPage) {
        this.pdfPage = pdfPage;
        this.pdfPageRotate = pdfPage.rotate;

        const totalRotation = (this.rotation + this.pdfPageRotate) % 360;

        this.viewport = pdfPage.getViewport({
            scale: this.scale * pdfjsLib.PixelsPerInch.PDF_TO_CSS_UNITS,
            rotation: totalRotation,
        });

        this.reset();
    }

    destroy() {
        this.reset();

        if (this.pdfPage) {
            this.pdfPage.cleanup();
        }
    }

    reset({ keepZoomLayer = false, keepAnnotationLayer = false, keepXfaLayer = false } = {}) {
        this.cancelRendering({ keepAnnotationLayer, keepXfaLayer });
        this.renderingState = RenderingStates.INITIAL;

        const div = this.div;

        div.style.width = Math.floor(this.viewport.width) + "px";
        div.style.height = Math.floor(this.viewport.height) + "px";

        const childNodes = div.childNodes;

        for (let i = childNodes.length - 1; i >= 0; i--) {
            const node = childNodes[i];

            node.remove();
        }

        div.removeAttribute("data-loaded");

        this.loadingIconDiv = document.createElement("div");
        this.loadingIconDiv.className = "loadingIcon notVisible";
        if (this._isStandalone) {
            this.toggleLoadingIconSpinner(/* viewVisible = */ true);
        }
        this.loadingIconDiv.setAttribute("role", "img");
        this.loadingIconDiv?.setAttribute("aria-label", "Loading");
                
        div.appendChild(this.loadingIconDiv);
    }

    update({ scale = 0, rotation = null, optionalContentConfigPromise = null }) {
        this.scale = scale || this.scale;
        if (typeof rotation === "number") {
            this.rotation = rotation; // The rotation may be zero.
        }
        if (optionalContentConfigPromise instanceof Promise) {
            this._optionalContentConfigPromise = optionalContentConfigPromise;
        }

        const totalRotation = (this.rotation + this.pdfPageRotate) % 360;
        this.viewport = this.viewport.clone({
            scale: this.scale * PixelsPerInch.PDF_TO_CSS_UNITS,
            rotation: totalRotation,
        });

        if (this._isStandalone) {
            const { style } = document.documentElement;
            style.setProperty("--zoom-factor", this.scale);
        }

        if (this.svg) {
            this.cssTransform({
                target: this.svg,
                redrawAnnotationLayer: true,
                redrawXfaLayer: true,
            });

            this.eventBus.dispatch("pagerendered", {
                source: this,
                pageNumber: this.id,
                cssTransform: true,
                timestamp: performance.now(),
                error: this._renderError,
            });
            return;
        }

        let isScalingRestricted = false;
        if (this.canvas && this.maxCanvasPixels > 0) {
            const outputScale = this.outputScale;
            if (
                ((Math.floor(this.viewport.width) * outputScale.sx) | 0) *
                ((Math.floor(this.viewport.height) * outputScale.sy) | 0) >
                this.maxCanvasPixels
            ) {
                isScalingRestricted = true;
            }
        }

        if (this.canvas) {
            if (
                this.useOnlyCssZoom ||
                (this.hasRestrictedScaling && isScalingRestricted)
            ) {
                this.cssTransform({
                    target: this.canvas,
                    redrawAnnotationLayer: true,
                    redrawXfaLayer: true,
                });

                this.eventBus.dispatch("pagerendered", {
                    source: this,
                    pageNumber: this.id,
                    cssTransform: true,
                    timestamp: performance.now(),
                    error: this._renderError,
                });
                return;
            }
            if (!this.zoomLayer && !this.canvas.hidden) {
                this.zoomLayer = this.canvas.parentNode;
                this.zoomLayer.style.position = "absolute";
            }
        }
        if (this.zoomLayer) {
            this.cssTransform({ target: this.zoomLayer.firstChild });
        }
        this.reset({
            keepZoomLayer: true,
            keepAnnotationLayer: true,
            keepXfaLayer: true,
        });
    }

    cancelRendering({ keepAnnotationLayer = false, keepXfaLayer = false } = {}) {
        if (this.paintTask) {
            this.paintTask.cancel();
            this.paintTask = null;
        }
        this.resume = null;

        if (this.textLayer) {
            this.textLayer.cancel();
            this.textLayer = null;
        }
        if (
            this.annotationLayer &&
            (!keepAnnotationLayer || !this.annotationLayer.div)
        ) {
            this.annotationLayer.cancel();
            this.annotationLayer = null;
            this._annotationCanvasMap = null;
        }
        if (this.xfaLayer && (!keepXfaLayer || !this.xfaLayer.div)) {
            this.xfaLayer.cancel();
            this.xfaLayer = null;
            this.textHighlighter?.disable();
        }
        if (this._onTextLayerRendered) {
            this.eventBus._off("textlayerrendered", this._onTextLayerRendered);
            this._onTextLayerRendered = null;
        }
    }


    toggleLoadingIconSpinner(viewVisible = false) {
        this.loadingIconDiv?.classList.toggle("notVisible", !viewVisible);
    }

    draw() {
        if (this.renderingState !== RenderingStates.INITIAL) {
            console.error("Must be in new state before drawing");
            this.reset(); // Ensure that we reset all state to prevent issues.
        }
        const { div, pdfPage } = this;

        if (!pdfPage) {
            this.renderingState = RenderingStates.FINISHED;

            if (this.loadingIconDiv) {
                this.loadingIconDiv.remove();
                delete this.loadingIconDiv;
            }
            return Promise.reject(new Error("pdfPage is not loaded"));
        }

        this.renderingState = RenderingStates.RUNNING;

        // Wrap the canvas so that if it has a CSS transform for high DPI the
        // overflow will be hidden in Firefox.
        const canvasWrapper = document.createElement("div");
        canvasWrapper.style.width = div.style.width;
        canvasWrapper.style.height = div.style.height;
        canvasWrapper.classList.add("b-pdf-page-canvas");

        if (this.annotationLayer?.div) {
            // The annotation layer needs to stay on top.
            div.insertBefore(canvasWrapper, this.annotationLayer.div);
        } else {
            div.appendChild(canvasWrapper);
        }

        let textLayer = null;
        if (this.textLayerMode !== TextLayerMode.DISABLE && this.textLayerFactory) {
            const textLayerDiv = document.createElement("div");
            textLayerDiv.classList.add("b-pdf-page-text-layer");
            textLayerDiv.classList.add("textLayer");
            textLayerDiv.style.width = canvasWrapper.style.width;
            textLayerDiv.style.height = canvasWrapper.style.height;
            if (this.annotationLayer?.div) {
                // The annotation layer needs to stay on top.
                div.insertBefore(textLayerDiv, this.annotationLayer.div);
            } else {
                div.appendChild(textLayerDiv);
            }

            textLayer = this.textLayerFactory.createTextLayerBuilder(
                textLayerDiv,
                this.id - 1,
                this.viewport,
                this.textLayerMode === TextLayerMode.ENABLE_ENHANCE,
                this.eventBus,
                this.textHighlighter
            );
        }
        this.textLayer = textLayer;

        let renderContinueCallback = null;
        if (this.renderingQueue) {
            renderContinueCallback = cont => {
                if (!this.renderingQueue.isHighestPriority(this)) {
                    this.renderingState = RenderingStates.PAUSED;
                    this.resume = () => {
                        this.renderingState = RenderingStates.RUNNING;
                        cont();
                    };
                    return;
                }
                cont();
            };
        }

        const finishPaintTask = async (error = null) => {
            // The paintTask may have been replaced by a new one, so only remove
            // the reference to the paintTask if it matches the one that is
            // triggering this callback.
            if (paintTask === this.paintTask) {
                this.paintTask = null;
            }

            if (error instanceof pdfjsLib.RenderingCancelledException) {
                this._renderError = null;
                return;
            }
            this._renderError = error;

            this.renderingState = RenderingStates.FINISHED;

            if (this.loadingIconDiv) {
                this.loadingIconDiv.remove();
                delete this.loadingIconDiv;
            }
            //this._resetZoomLayer(/* removeFromDOM = */ true);

            //this.eventBus.dispatch("pagerendered", {
            //    source: this,
            //    pageNumber: this.id,
            //    cssTransform: false,
            //    timestamp: performance.now(),
            //    error: this._renderError,
            //});

            if (error) {
                throw error;
            }
        };

        const paintTask =
            this.renderer === RendererType.SVG
                ? this.paintOnSvg(canvasWrapper)
                : this.paintOnCanvas(canvasWrapper);
        paintTask.onRenderContinue = renderContinueCallback;
        this.paintTask = paintTask;

        const resultPromise = paintTask.promise.then(
            () => {
                return finishPaintTask(null).then(() => {
                    if (textLayer) {
                        const readableStream = pdfPage.streamTextContent({
                            includeMarkedContent: true,
                        });
                        textLayer.setTextContentStream(readableStream);
                        textLayer.render();
                    }

                    if (this.annotationLayer) {
                        this._renderAnnotationLayer();
                    }
                });
            },
            function (reason) {
                return finishPaintTask(reason);
            }
        );

        return resultPromise;
    }

    paintOnCanvas(canvasWrapper) {
        const renderCapability = pdfjsLib.createPromiseCapability();
        const result = {
            promise: renderCapability.promise,
            onRenderContinue(cont) {
                cont();
            },
            cancel() {
                renderTask.cancel();
            },
        };

        const viewport = this.viewport;
        const canvas = document.createElement("canvas");

        // Keep the canvas hidden until the first draw callback, or until drawing
        // is complete when `!this.renderingQueue`, to prevent black flickering.
        canvas.hidden = true;
        let isCanvasHidden = true;
        const showCanvas = function () {
            if (isCanvasHidden) {
                canvas.hidden = false;
                isCanvasHidden = false;
            }
        };

        canvasWrapper.appendChild(canvas);
        this.canvas = canvas;

        const ctx = canvas.getContext("2d", { alpha: false });
        const outputScale = (this.outputScale = new OutputScale());

        if (this.useOnlyCssZoom) {
            const actualSizeViewport = viewport.clone({
                scale: pdfjsLib.PixelsPerInch.PDF_TO_CSS_UNITS,
            });
            // Use a scale that makes the canvas have the originally intended size
            // of the page.
            outputScale.sx *= actualSizeViewport.width / viewport.width;
            outputScale.sy *= actualSizeViewport.height / viewport.height;
        }

        if (this.maxCanvasPixels > 0) {
            const pixelsInViewport = viewport.width * viewport.height;
            const maxScale = Math.sqrt(this.maxCanvasPixels / pixelsInViewport);
            if (outputScale.sx > maxScale || outputScale.sy > maxScale) {
                outputScale.sx = maxScale;
                outputScale.sy = maxScale;
                this.hasRestrictedScaling = true;
            } else {
                this.hasRestrictedScaling = false;
            }
        }

        const sfx = approximateFraction(outputScale.sx);
        const sfy = approximateFraction(outputScale.sy);
        canvas.width = roundToDivide(viewport.width * outputScale.sx, sfx[0]);
        canvas.height = roundToDivide(viewport.height * outputScale.sy, sfy[0]);
        canvas.style.width = roundToDivide(viewport.width, sfx[1]) + "px";
        canvas.style.height = roundToDivide(viewport.height, sfy[1]) + "px";

        // Add the viewport so it's known what it was originally drawn with.
        this.paintedViewportMap.set(canvas, viewport);

        // Rendering area
        const transform = outputScale.scaled ? [outputScale.sx, 0, 0, outputScale.sy, 0, 0] : null;

        const renderContext = {
            canvasContext: ctx,
            transform,
            viewport: this.viewport,
            //annotationMode: this.annotationMode,
            //optionalContentConfigPromise: this._optionalContentConfigPromise,
            //annotationCanvasMap: this._annotationCanvasMap,
        };

        const renderTask = this.pdfPage.render(renderContext);
        renderTask.onContinue = function (cont) {
            showCanvas();
            if (result.onRenderContinue) {
                result.onRenderContinue(cont);
            } else {
                cont();
            }
        };

        renderTask.promise.then(
            function () {
                showCanvas();
                renderCapability.resolve();
            },
            function (error) {
                showCanvas();
                renderCapability.reject(error);
            }
        );

        return result;
    }

    paintOnSvg(wrapper) {
        if (typeof PDFJSDev !== "undefined" && PDFJSDev.test("MOZCENTRAL || CHROME")) {
            // Return a mock object, to prevent errors such as e.g.
            // "TypeError: paintTask.promise is undefined".
            return {
                promise: Promise.reject(new Error("SVG rendering is not supported.")),
                onRenderContinue(cont) { },
                cancel() { },
            };
        }

        let cancelled = false;
        const ensureNotCancelled = () => {
            if (cancelled) {
                throw new pdfjsLib.RenderingCancelledException(
                    `Rendering cancelled, page ${this.id}`,
                    "svg"
                );
            }
        };

        const pdfPage = this.pdfPage;
        const actualSizeViewport = this.viewport.clone({
            scale: pdfjsLib.PixelsPerInch.PDF_TO_CSS_UNITS,
        });
        const promise = pdfPage
            .getOperatorList({
                annotationMode: this.annotationMode,
            })
            .then(opList => {
                ensureNotCancelled();
                const svgGfx = new pdfjsLib.SVGGraphics(pdfPage.commonObjs, pdfPage.objs);
                return svgGfx.getSVG(opList, actualSizeViewport).then(svg => {
                    ensureNotCancelled();
                    this.svg = svg;
                    this.paintedViewportMap.set(svg, actualSizeViewport);

                    svg.style.width = wrapper.style.width;
                    svg.style.height = wrapper.style.height;
                    this.renderingState = RenderingStates.FINISHED;
                    wrapper.appendChild(svg);
                });
            });

        return {
            promise,
            onRenderContinue(cont) {
                cont();
            },
            cancel() {
                cancelled = true;
            },
        };
    }
}