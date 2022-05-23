import { PdfViewerBase } from "./PdfViewerBase.js";
import { ScrollMode, SpreadMode } from "./ui-utils.js";

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

export { PdfSinglePageViewer, PdfViewer };