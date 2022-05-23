export class TextLayerBuilder {
    constructor({
        textLayerDiv,
        eventBus,
        pageIndex,
        viewport,
        highlighter = null,
        enhanceTextSelection = false,
    }) {
        this.textLayerDiv = textLayerDiv;
        this.eventBus = eventBus;
        this.textContent = null;
        this.textContentItemsStr = [];
        this.textContentStream = null;
        this.renderingDone = false;
        this.pageNumber = pageIndex + 1;
        this.viewport = viewport;
        this.textDivs = [];
        this.textLayerRenderTask = null;
        this.highlighter = highlighter;
        this.enhanceTextSelection = enhanceTextSelection;

        this._bindMouse();
    }

    /**
     * @private
     */
    _finishRendering() {
        this.renderingDone = true;

        if (!this.enhanceTextSelection) {
            const endOfContent = document.createElement("div");
            endOfContent.className = "endOfContent";
            this.textLayerDiv.appendChild(endOfContent);
        }

        //this.eventBus.dispatch("textlayerrendered", {
        //    source: this,
        //    pageNumber: this.pageNumber,
        //    numTextDivs: this.textDivs.length,
        //});
    }

    /**
     * Renders the text layer.
     *
     * @param {number} [timeout] - Wait for a specified amount of milliseconds
     *                             before rendering.
     */
    render(timeout = 0) {
        if (!(this.textContent || this.textContentStream) || this.renderingDone) {
            return;
        }
        this.cancel();

        this.textDivs.length = 0;
        this.highlighter?.setTextMapping(this.textDivs, this.textContentItemsStr);

        const textLayerFrag = document.createDocumentFragment();
        this.textLayerRenderTask = pdfjsLib.renderTextLayer({
            textContent: this.textContent,
            textContentStream: this.textContentStream,
            container: textLayerFrag,
            viewport: this.viewport,
            textDivs: this.textDivs,
            textContentItemsStr: this.textContentItemsStr,
            timeout,
            enhanceTextSelection: this.enhanceTextSelection,
        });
        this.textLayerRenderTask.promise.then(
            () => {
                this.textLayerDiv.appendChild(textLayerFrag);
                this._finishRendering();
                this.highlighter?.enable();
            },
            function (reason) {
                // Cancelled or failed to render text layer; skipping errors.
            }
        );
    }

    /**
     * Cancel rendering of the text layer.
     */
    cancel() {
        if (this.textLayerRenderTask) {
            this.textLayerRenderTask.cancel();
            this.textLayerRenderTask = null;
        }
        this.highlighter?.disable();
    }

    setTextContentStream(readableStream) {
        this.cancel();
        this.textContentStream = readableStream;
    }

    setTextContent(textContent) {
        this.cancel();
        this.textContent = textContent;
    }

    /**
     * Improves text selection by adding an additional div where the mouse was
     * clicked. This reduces flickering of the content if the mouse is slowly
     * dragged up or down.
     *
     * @private
     */
    _bindMouse() {
        const div = this.textLayerDiv;
        let expandDivsTimer = null;

        div.addEventListener("mousedown", evt => {
            if (this.enhanceTextSelection && this.textLayerRenderTask) {
                this.textLayerRenderTask.expandTextDivs(true);
                if (
                    (typeof PDFJSDev === "undefined" || !PDFJSDev.test("MOZCENTRAL")) &&
                    expandDivsTimer
                ) {
                    clearTimeout(expandDivsTimer);
                    expandDivsTimer = null;
                }
                return;
            }

            const end = div.querySelector(".endOfContent");
            if (!end) {
                return;
            }
            if (typeof PDFJSDev === "undefined" || !PDFJSDev.test("MOZCENTRAL")) {
                // On non-Firefox browsers, the selection will feel better if the height
                // of the `endOfContent` div is adjusted to start at mouse click
                // location. This avoids flickering when the selection moves up.
                // However it does not work when selection is started on empty space.
                let adjustTop = evt.target !== div;
                if (typeof PDFJSDev === "undefined" || PDFJSDev.test("GENERIC")) {
                    adjustTop =
                        adjustTop &&
                        window
                            .getComputedStyle(end)
                            .getPropertyValue("-moz-user-select") !== "none";
                }
                if (adjustTop) {
                    const divBounds = div.getBoundingClientRect();
                    const r = Math.max(0, (evt.pageY - divBounds.top) / divBounds.height);
                    end.style.top = (r * 100).toFixed(2) + "%";
                }
            }
            end.classList.add("active");
        });

        div.addEventListener("mouseup", () => {
            if (this.enhanceTextSelection && this.textLayerRenderTask) {
                if (typeof PDFJSDev === "undefined" || !PDFJSDev.test("MOZCENTRAL")) {
                    expandDivsTimer = setTimeout(() => {
                        if (this.textLayerRenderTask) {
                            this.textLayerRenderTask.expandTextDivs(false);
                        }
                        expandDivsTimer = null;
                    }, EXPAND_DIVS_TIMEOUT);
                } else {
                    this.textLayerRenderTask.expandTextDivs(false);
                }
                return;
            }

            const end = div.querySelector(".endOfContent");
            if (!end) {
                return;
            }
            if (typeof PDFJSDev === "undefined" || !PDFJSDev.test("MOZCENTRAL")) {
                end.style.top = "";
            }
            end.classList.remove("active");
        });
    }
}