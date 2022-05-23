import { PdfViewerBase } from "./PdfViewerBase.js";
import { EventBus } from "./event-utils.js";
import { RendererType, ScrollMode, SpreadMode } from "./ui-utils.js";
import { PdfRenderingQueue } from "./PdfRenderingQueue.js";

class PdfViewer extends PdfViewerBase { }

class PdfSinglePageViewer extends PdfViewerBase {
    _resetView() {
        super._resetView();
        this._scrollMode = ScrollMode.PAGE;
        this._spreadMode = SpreadMode.NONE;
    }

    // eslint-disable-next-line accessor-pairs
    set scrollMode(mode) { }

    _updateScrollMode() { }

    // eslint-disable-next-line accessor-pairs
    set spreadMode(mode) { }

    _updateSpreadMode() { }
}

export class PdfViewerApplication {
    constructor(options) {
        const eventBus = new EventBus();
        this.eventBus = eventBus;

        const pdfRenderingQueue = new PdfRenderingQueue();
        pdfRenderingQueue.onIdle = this._cleanup.bind(this);
        this.pdfRenderingQueue = pdfRenderingQueue;

        this.pdfDocument = null;
        this.pdfLoadingTask = null;

        const container = options.container;
        const viewer = options.viewer;

        this.pdfViewer = new PdfViewer({
            container: container,
            viewer: viewer,
            eventBus: eventBus,
            renderingQueue: pdfRenderingQueue,
        });

        pdfRenderingQueue.setViewer(this.pdfViewer);
    }

    _cleanup() {
        if (!this.pdfDocument) {
            return; // run cleanup when document is loaded
        }
        this.pdfViewer.cleanup();
        //this.pdfThumbnailViewer.cleanup();

        // We don't want to remove fonts used by active page SVGs.
        this.pdfDocument.cleanup(this.pdfViewer.renderer === RendererType.SVG);
    }

    async open(pdfjsLib, source) {
        if (this.pdfLoadingTask) {
            await this.close(pdfLoadingTask);
        }

        const loadingTask = pdfjsLib.getDocument({ url: source });
        this.pdfLoadingTask = loadingTask;

        loadingTask.onProgress = ({ loaded, total }) => {
            console.log(loaded / total);
            /*this.progress(loaded / total);*/
        };

        return loadingTask.promise.then(
            pdfDocument => {
                this.load(pdfDocument);
            },
            reason => {
                if (loadingTask !== this.pdfLoadingTask) {
                    return undefined; // Ignore errors for previously opened PDF files.
                }

                let key = "loading_error";

                if (reason instanceof InvalidPDFException) {
                    key = "invalid_file_error";
                } else if (reason instanceof MissingPDFException) {
                    key = "missing_file_error";
                } else if (reason instanceof UnexpectedResponseException) {
                    key = "unexpected_response_error";
                }

                console.log(key);

                throw reason;
            });
    }

    async close() {
        if (!this.pdfLoadingTask) {
            return;
        }

        const promises = [];

        promises.push(this.pdfLoadingTask.destroy());
        this.pdfLoadingTask = null;

        if (this.pdfDocument) {
            this.pdfDocument = null;

            this.pdfViewer.setDocument(null);
        }

        await Promise.all(promises);
    }

    load(pdfDocument) {
        this.pdfDocument = pdfDocument;

        // Since the `setInitialView` call below depends on this being resolved,
        // fetch it early to avoid delaying initial rendering of the PDF document.
        const pageLayoutPromise = pdfDocument.getPageLayout().catch(function () {
            /* Avoid breaking initial rendering; ignoring errors. */
        });
        const pageModePromise = pdfDocument.getPageMode().catch(function () {
            /* Avoid breaking initial rendering; ignoring errors. */
        });
        const openActionPromise = pdfDocument.getOpenAction().catch(function () {
            /* Avoid breaking initial rendering; ignoring errors. */
        });

        const pdfViewer = this.pdfViewer;
        pdfViewer.setDocument(pdfDocument);
        //const { firstPagePromise, onePageRendered, pagesPromise } = pdfViewer;
    }

    get pagesCount() {
        return this.pdfDocument ? this.pdfDocument.numPages : 0;
    }

    get page() {
        return this.pdfViewer.currentPageNumber;
    }

    set page(val) {
        this.pdfViewer.currentPageNumber = val;
    }
}