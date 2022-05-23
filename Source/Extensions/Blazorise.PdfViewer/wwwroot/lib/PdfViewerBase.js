import { PdfRenderingQueue } from "./PdfRenderingQueue.js";
import { PdfPageViewBuffer } from "./PdfPageViewBuffer.js";
import { TextLayerBuilder } from "./TextLayerBuilder.js";
import { PdfPageView } from "./PdfPageView.js";

import { DEFAULT_SCALE, UNKNOWN_SCALE, DEFAULT_CACHE_SIZE, ScrollMode, SpreadMode, RendererType, TextLayerMode, PresentationModeState, RenderingStates, VERTICAL_PADDING, SCROLLBAR_PADDING, MAX_AUTO_SCALE } from "./base.js";
import { watchScroll, getVisibleElements, OutputScale, approximateFraction, roundToDivide, scrollIntoView, isPortraitOrientation } from "./ui-utils.js";

export class PdfViewerBase {
    constructor(options) {
        this.previousContainerHeight = 0;

        this.container = options.container;
        this.viewer = options.viewer || options.container.firstElementChild;
        this.eventBus = options.eventBus;
        this.textLayerMode = options.textLayerMode ?? TextLayerMode.ENABLE;
        this.annotationMode = options.annotationMode ?? pdfjsLib.AnnotationMode.ENABLE_FORMS;
        this.renderer = options.renderer || RendererType.CANVAS;

        //this.defaultRenderingQueue = !options.renderingQueue;

        //if (this.defaultRenderingQueue) {
        //    // Custom rendering queue is not specified, using default one
        //    this.renderingQueue = new PdfRenderingQueue();
        //    this.renderingQueue.setViewer(this);
        //} else {
        this.renderingQueue = options.renderingQueue;
        //}

        this.scroll = watchScroll(this.container, this._scrollUpdate.bind(this));
        this.presentationModeState = PresentationModeState.UNKNOWN;
        this._resetView();
    }

    _resetView() {
        this._pages = [];
        this._currentPageNumber = 1;
        this._currentScale = UNKNOWN_SCALE;
        this._currentScaleValue = null;
        this.buffer = new PdfPageViewBuffer(DEFAULT_CACHE_SIZE);
        this._firstPageCapability = pdfjsLib.createPromiseCapability();
        this._onePageRenderedCapability = pdfjsLib.createPromiseCapability();
        this._pagesCapability = pdfjsLib.createPromiseCapability();
        this._scrollMode = ScrollMode.VERTICAL;
        this._previousScrollMode = ScrollMode.UNKNOWN;
        this._spreadMode = SpreadMode.NONE;

        this.scrollModePageState = {
            previousPageNumber: 1,
            scrollDown: true,
            pages: [],
        };
    }

    cleanup() {
        for (let i = 0, length = this._pages.length; i < length; i++) {
            if (this._pages[i] && this._pages[i].renderingState !== RenderingStates.FINISHED) {
                this._pages[i].reset();
            }
        }
    }

    createTextLayerBuilder(
        textLayerDiv,
        pageIndex,
        viewport,
        enhanceTextSelection = false,
        eventBus,
        highlighter
    ) {
        return new TextLayerBuilder({
            textLayerDiv,
            eventBus,
            pageIndex,
            viewport,
            enhanceTextSelection: this.isInPresentationMode
                ? false
                : enhanceTextSelection,
            highlighter,
        });
    }

    setDocument(pdfDocument) {
        if (this.pdfDocument) {
            this._resetView();
        }

        this.pdfDocument = pdfDocument;

        if (!pdfDocument) {
            return;
        }

        const pagesCount = pdfDocument.numPages;
        const firstPagePromise = pdfDocument.getPage(1);
        //const optionalContentConfigPromise = pdfDocument.getOptionalContentConfig();

        this._scrollMode = ScrollMode.PAGE;

        Promise.all([firstPagePromise])
            .then(([firstPdfPage]) => {
                this._firstPageCapability.resolve(firstPdfPage);

                const viewerElement = this._scrollMode === ScrollMode.PAGE ? null : this.viewer;

                const scale = this.currentScale;
                const viewport = firstPdfPage.getViewport({
                    scale: scale * pdfjsLib.PixelsPerInch.PDF_TO_CSS_UNITS,
                });

                const textLayerFactory = this.textLayerMode !== TextLayerMode.DISABLE ? this : null;
                const annotationLayerFactory = this.annotationMode !== pdfjsLib.AnnotationMode.DISABLE ? this : null;

                for (let pageNum = 1; pageNum <= pagesCount; ++pageNum) {
                    const pageView = new PdfPageView({
                        container: viewerElement,
                        id: pageNum,
                        defaultViewport: viewport.clone(),
                        renderingQueue: this.renderingQueue,
                        textLayerFactory: textLayerFactory,
                        textLayerMode: this.textLayerMode,
                        annotationLayerFactory: annotationLayerFactory,
                        annotationMode: this.annotationMode,
                        renderer: this.renderer
                    });

                    this._pages.push(pageView);
                }

                // Set the first `pdfPage` immediately, since it's already loaded rather than having to repeat.
                const firstPageView = this._pages[0];
                if (firstPageView) {
                    firstPageView.setPdfPage(firstPdfPage);
                    //this.linkService.cachePageRef(1, firstPdfPage.ref);
                }

                if (this._scrollMode === ScrollMode.PAGE) {
                    // Ensure that the current page becomes visible on document load.
                    this.ensurePageViewVisible();
                }
                else if (this._spreadMode !== SpreadMode.NONE) {
                    this._updateSpreadMode();
                }

                //if (this.defaultRenderingQueue) {
                this.update();
                //}
            })
            .catch(reason => {
                console.error("Unable to initialize viewer", reason);
            });
    }

    get spreadMode() {
        return this._spreadMode;
    }

    set spreadMode(mode) {
        if (this._spreadMode === mode) {
            return; // The Spread mode didn't change.
        }
        if (!isValidSpreadMode(mode)) {
            throw new Error(`Invalid spread mode: ${mode}`);
        }
        this._spreadMode = mode;
        this.eventBus.dispatch("spreadmodechanged", { source: this, mode });

        this._updateSpreadMode(/* pageNumber = */ this._currentPageNumber);
    }

    _updateSpreadMode(pageNumber = null) {
        if (!this.pdfDocument) {
            return;
        }
        const viewer = this.viewer,
            pages = this._pages;

        if (this._scrollMode === ScrollMode.PAGE) {
            this.ensurePageViewVisible();
        } else {
            // Temporarily remove all the pages from the DOM.
            viewer.textContent = "";

            if (this._spreadMode === SpreadMode.NONE) {
                for (let i = 0, ii = pages.length; i < ii; ++i) {
                    viewer.appendChild(pages[i].div);
                }
            } else {
                const parity = this._spreadMode - 1;
                let spread = null;
                for (let i = 0, ii = pages.length; i < ii; ++i) {
                    if (spread === null) {
                        spread = document.createElement("div");
                        spread.className = "spread";
                        viewer.appendChild(spread);
                    } else if (i % 2 === parity) {
                        spread = spread.cloneNode(false);
                        viewer.appendChild(spread);
                    }
                    spread.appendChild(pages[i].div);
                }
            }
        }

        if (!pageNumber) {
            return;
        }
        // Non-numeric scale values can be sensitive to the scroll orientation.
        // Call this before re-scrolling to the current page, to ensure that any
        // changes in scale don't move the current page.
        if (this._currentScaleValue && isNaN(this._currentScaleValue)) {
            this._setScale(this._currentScaleValue, true);
        }
        this._setCurrentPageNumber(pageNumber, /* resetCurrentPageView = */ true);
        this.update();
    }

    get isInPresentationMode() {
        return this.presentationModeState === PresentationModeState.FULLSCREEN;
    }

    get isChangingPresentationMode() {
        return this.presentationModeState === PresentationModeState.CHANGING;
    }

    get isHorizontalScrollbarEnabled() {
        return this.isInPresentationMode
            ? false
            : this.container.scrollWidth > this.container.clientWidth;
    }

    get isVerticalScrollbarEnabled() {
        return this.isInPresentationMode
            ? false
            : this.container.scrollHeight > this.container.clientHeight;
    }

    get pagesCount() {
        return this._pages.length;
    }

    getPageView(index) {
        return this._pages[index];
    }

    ensurePageViewVisible() {
        if (this._scrollMode !== ScrollMode.PAGE) {
            throw new Error("#ensurePageViewVisible: Invalid scrollMode value.");
        }
        const pageNumber = this._currentPageNumber,
            state = this.scrollModePageState,
            viewer = this.viewer;

        // Temporarily remove all the pages from the DOM...
        viewer.textContent = "";
        // ... and clear out the active ones.
        state.pages.length = 0;

        if (this._spreadMode === SpreadMode.NONE) {
            // Finally, append the new page to the viewer.
            const pageView = this._pages[pageNumber - 1];

            if (this.isInPresentationMode) {
                const spread = document.createElement("div");
                spread.className = "spread";
                const dummyPage = document.createElement("div");
                dummyPage.className = "dummyPage";
                dummyPage.style.height = `${this.container.clientHeight}px`;

                spread.appendChild(dummyPage);
                spread.appendChild(pageView.div);
                viewer.appendChild(spread);
            } else {
                viewer.appendChild(pageView.div);
            }

            state.pages.push(pageView);
        } else {
            const pageIndexSet = new Set(),
                parity = this._spreadMode - 1;

            // Determine the pageIndices in the new spread.
            if (pageNumber % 2 !== parity) {
                // Left-hand side page.
                pageIndexSet.add(pageNumber - 1);
                pageIndexSet.add(pageNumber);
            } else {
                // Right-hand side page.
                pageIndexSet.add(pageNumber - 2);
                pageIndexSet.add(pageNumber - 1);
            }

            // Finally, append the new pages to the viewer and apply the spreadMode.
            let spread = null;
            for (const i of pageIndexSet) {
                const pageView = this._pages[i];
                if (!pageView) {
                    continue;
                }
                if (spread === null) {
                    spread = document.createElement("div");
                    spread.className = "spread";
                    viewer.appendChild(spread);
                } else if (i % 2 === parity) {
                    spread = spread.cloneNode(false);
                    viewer.appendChild(spread);
                }
                spread.appendChild(pageView.div);

                state.pages.push(pageView);
            }
        }

        state.scrollDown = pageNumber >= state.previousPageNumber;
        state.previousPageNumber = pageNumber;
    }

    _scrollUpdate() {
        if (this.pagesCount === 0) {
            return;
        }
        this.update();
    }

    update() {
        const visible = this._getVisiblePages();
        const visiblePages = visible.views, numVisiblePages = visiblePages.length;

        if (numVisiblePages === 0) {
            return;
        }

        const newCacheSize = Math.max(DEFAULT_CACHE_SIZE, 2 * numVisiblePages + 1);
        this.buffer.resize(newCacheSize, visible.ids);

        this.renderingQueue.renderHighestPriority(visible);
    }

    getScrollAhead(visible) {
        if (visible.first?.id === 1) {
            return true;
        } else if (visible.last?.id === this.pagesCount) {
            return false;
        }
        switch (this._scrollMode) {
            case ScrollMode.PAGE:
                return this.scrollModePageState.scrollDown;
            case ScrollMode.HORIZONTAL:
                return this.scroll.right;
        }
        return this.scroll.down;
    }

    toggleLoadingIconSpinner(visibleIds) {
        for (const id of visibleIds) {
            const pageView = this._pages[id - 1];
            pageView?.toggleLoadingIconSpinner(/* viewVisible = */ true);
        }
        for (const pageView of this.buffer) {
            if (visibleIds.has(pageView.id)) {
                // Handled above, since the "buffer" may not contain all visible pages.
                continue;
            }
            pageView.toggleLoadingIconSpinner(/* viewVisible = */ false);
        }
    }

    async ensurePdfPageLoaded(pageView) {
        if (pageView.pdfPage) {
            return pageView.pdfPage;
        }
        try {
            const pdfPage = await this.pdfDocument.getPage(pageView.id);
            if (!pageView.pdfPage) {
                pageView.setPdfPage(pdfPage);
            }
            //if (!this.linkService._cachedPageNumber?.(pdfPage.ref)) {
            //    this.linkService.cachePageRef(pageView.id, pdfPage.ref);
            //}
            return pdfPage;
        } catch (reason) {
            console.error("Unable to get page for page view", reason);
            return null; // Page error -- there is nothing that can be done.
        }
    }

    _getVisiblePages() {
        const views = this._scrollMode === ScrollMode.PAGE ? this.scrollModePageState.pages : this._pages;
        const horizontal = this._scrollMode === ScrollMode.HORIZONTAL;
        const rtl = horizontal && this._isContainerRtl;

        return getVisibleElements({
            scrollEl: this.container,
            views,
            sortByVisibility: true,
            horizontal,
            rtl,
        });
    }

    forceRendering(currentlyVisiblePages) {
        const visiblePages = currentlyVisiblePages || this._getVisiblePages();
        const scrollAhead = this.getScrollAhead(visiblePages);
        const preRenderExtra = this._spreadMode !== SpreadMode.NONE && this._scrollMode !== ScrollMode.HORIZONTAL;

        const pageView = this.renderingQueue.getHighestPriority(
            visiblePages,
            this._pages,
            scrollAhead,
            preRenderExtra
        );

        this.toggleLoadingIconSpinner(visiblePages.ids);

        if (pageView) {
            this.ensurePdfPageLoaded(pageView).then(() => {
                this.renderingQueue.renderView(pageView);
            });
            return true;
        }

        return false;
    }

    get currentScale() {
        return this._currentScale !== UNKNOWN_SCALE ? this._currentScale : DEFAULT_SCALE;
    }

    set currentScale(val) {
        if (isNaN(val)) {
            throw new Error("Invalid numeric scale.");
        }
        if (!this.pdfDocument) {
            return;
        }
        this._setScale(val, false);
    }

    _setScale(value, noScroll = false) {
        let scale = parseFloat(value);

        if (scale > 0) {
            this._setScaleUpdatePages(scale, value, noScroll, /* preset = */ false);
        } else {
            const currentPage = this._pages[this._currentPageNumber - 1];
            if (!currentPage) {
                return;
            }
            let hPadding = SCROLLBAR_PADDING,
                vPadding = VERTICAL_PADDING;

            if (this.isInPresentationMode) {
                hPadding = vPadding = 4;
            } else if (this.removePageBorders) {
                hPadding = vPadding = 0;
            }
            if (this._scrollMode === ScrollMode.HORIZONTAL) {
                [hPadding, vPadding] = [vPadding, hPadding]; // Swap the padding values.
            }
            const pageWidthScale =
                (((this.container.clientWidth - hPadding) / currentPage.width) *
                    currentPage.scale) /
                this._pageWidthScaleFactor;
            const pageHeightScale =
                ((this.container.clientHeight - vPadding) / currentPage.height) *
                currentPage.scale;
            switch (value) {
                case "page-actual":
                    scale = 1;
                    break;
                case "page-width":
                    scale = pageWidthScale;
                    break;
                case "page-height":
                    scale = pageHeightScale;
                    break;
                case "page-fit":
                    scale = Math.min(pageWidthScale, pageHeightScale);
                    break;
                case "auto":
                    // For pages in landscape mode, fit the page height to the viewer
                    // *unless* the page would thus become too wide to fit horizontally.
                    const horizontalScale = isPortraitOrientation(currentPage)
                        ? pageWidthScale
                        : Math.min(pageHeightScale, pageWidthScale);
                    scale = Math.min(MAX_AUTO_SCALE, horizontalScale);
                    break;
                default:
                    console.error(`_setScale: "${value}" is an unknown zoom value.`);
                    return;
            }
            this._setScaleUpdatePages(scale, value, noScroll, /* preset = */ true);
        }
    }

    _isSameScale(newScale) {
        if (this.isInPresentationMode && this.container.clientHeight !== this.previousContainerHeight
        ) {
            // Ensure that the current page remains centered vertically if/when
            // the window is resized while PresentationMode is active.
            return false;
        }
        return (
            newScale === this._currentScale ||
            Math.abs(newScale - this._currentScale) < 1e-15
        );
    }

    _setScaleUpdatePages(newScale, newValue, noScroll = false, preset = false) {
        this._currentScaleValue = newValue.toString();

        if (this._isSameScale(newScale)) {
            if (preset) {
                this.eventBus.dispatch("scalechanging", {
                    source: this,
                    scale: newScale,
                    presetValue: newValue,
                });
            }
            return;
        }

        this._doc.style.setProperty("--zoom-factor", newScale);

        const updateArgs = { scale: newScale };
        for (const pageView of this._pages) {
            pageView.update(updateArgs);
        }
        this._currentScale = newScale;

        if (!noScroll) {
            let page = this._currentPageNumber,
                dest;
            if (
                this._location &&
                !(this.isInPresentationMode || this.isChangingPresentationMode)
            ) {
                page = this._location.pageNumber;
                dest = [
                    null,
                    { name: "XYZ" },
                    this._location.left,
                    this._location.top,
                    null,
                ];
            }
            this.scrollPageIntoView({
                pageNumber: page,
                destArray: dest,
                allowNegativeOffset: true,
            });
        }

        this.eventBus.dispatch("scalechanging", {
            source: this,
            scale: newScale,
            presetValue: preset ? newValue : undefined,
        });

        //if (this.defaultRenderingQueue) {
        this.update();
        //}

        this.previousContainerHeight = this.container.clientHeight;
    }

    get currentPageNumber() {
        return this._currentPageNumber;
    }

    set currentPageNumber(val) {
        if (!Number.isInteger(val)) {
            throw new Error("Invalid page number.");
        }
        if (!this.pdfDocument) {
            return;
        }
        // The intent can be to just reset a scroll position and/or scale.
        if (!this._setCurrentPageNumber(val, true)) {
            console.error(`currentPageNumber: "${val}" is not a valid page.`);
        }
    }

    _setCurrentPageNumber(val, resetCurrentPageView = false) {
        if (this._currentPageNumber === val) {
            if (resetCurrentPageView) {
                this._resetCurrentPageView();
            }
            return true;
        }

        if (!(0 < val && val <= this.pagesCount)) {
            return false;
        }
        const previous = this._currentPageNumber;
        this._currentPageNumber = val;

        //this.eventBus.dispatch("pagechanging", {
        //    source: this,
        //    pageNumber: val,
        //    pageLabel: this._pageLabels?.[val - 1] ?? null,
        //    previous,
        //});

        if (resetCurrentPageView) {
            this._resetCurrentPageView();
        }
        return true;
    }

    _resetCurrentPageView() {
        if (this.isInPresentationMode) {
            // Fixes the case when PDF has different page sizes.
            this._setScale(this._currentScaleValue, true);
        }

        const pageView = this._pages[this._currentPageNumber - 1];
        this._scrollIntoView({ pageDiv: pageView.div });
    }

    _scrollIntoView({ pageDiv, pageSpot = null, pageNumber = null }) {
        if (this._scrollMode === ScrollMode.PAGE) {
            if (pageNumber) {
                // Ensure that `this._currentPageNumber` is correct.
                this._setCurrentPageNumber(pageNumber);
            }
            this.ensurePageViewVisible();
            // Ensure that rendering always occurs, to avoid showing a blank page,
            // even if the current position doesn't change when the page is scrolled.
            this.update();
        }

        if (!pageSpot && !this.isInPresentationMode) {
            const left = pageDiv.offsetLeft + pageDiv.clientLeft;
            const right = left + pageDiv.clientWidth;
            const { scrollLeft, clientWidth } = this.container;
            if (
                this._scrollMode === ScrollMode.HORIZONTAL ||
                left < scrollLeft ||
                right > scrollLeft + clientWidth
            ) {
                pageSpot = { left: 0, top: 0 };
            }
        }
        scrollIntoView(pageDiv, pageSpot);
    }

    get currentScale() {
        return this._currentScale !== UNKNOWN_SCALE
            ? this._currentScale
            : DEFAULT_SCALE;
    }

    set currentScale(val) {
        if (isNaN(val)) {
            throw new Error("Invalid numeric scale.");
        }
        if (!this.pdfDocument) {
            return;
        }
        this._setScale(val, false);
    }

    get currentScaleValue() {
        return this._currentScaleValue;
    }

    set currentScaleValue(val) {
        if (!this.pdfDocument) {
            return;
        }
        this._setScale(val, false);
    }
}