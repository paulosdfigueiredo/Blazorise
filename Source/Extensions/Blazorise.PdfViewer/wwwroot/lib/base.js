const DEFAULT_SCALE_VALUE = "auto";
const DEFAULT_SCALE = 1.0;
const DEFAULT_SCALE_DELTA = 1.1;
const MIN_SCALE = 0.1;
const MAX_SCALE = 10.0;
const UNKNOWN_SCALE = 0;
const MAX_AUTO_SCALE = 1.25;
const SCROLLBAR_PADDING = 40;
const VERTICAL_PADDING = 5;
const DEFAULT_CACHE_SIZE = 10;

const RenderingStates = {
    INITIAL: 0,
    RUNNING: 1,
    PAUSED: 2,
    FINISHED: 3,
};

const RendererType = {
    CANVAS: "canvas",
    SVG: "svg",
};

const TextLayerMode = {
    DISABLE: 0,
    ENABLE: 1,
    ENABLE_ENHANCE: 2,
};

const ScrollMode = {
    UNKNOWN: -1,
    VERTICAL: 0, // Default value.
    HORIZONTAL: 1,
    WRAPPED: 2,
    PAGE: 3,
};

const PresentationModeState = {
    UNKNOWN: 0,
    NORMAL: 1,
    CHANGING: 2,
    FULLSCREEN: 3,
};

const SpreadMode = {
    UNKNOWN: -1,
    NONE: 0, // Default value.
    ODD: 1,
    EVEN: 2,
};

const BaseException = (function BaseExceptionClosure() {
    function BaseException(message, name) {
        if (this.constructor === BaseException) {
            unreachable("Cannot initialize BaseException.");
        }
        this.message = message;
        this.name = name;
    }
    BaseException.prototype = new Error();
    BaseException.constructor = BaseException;

    return BaseException;
})();

class UnknownErrorException extends BaseException {
    constructor(msg, details) {
        super(msg, "UnknownErrorException");
        this.details = details;
    }
}

class InvalidPdfException extends BaseException {
    constructor(msg) {
        super(msg, "InvalidPdfException");
    }
}

class MissingPdfException extends BaseException {
    constructor(msg) {
        super(msg, "MissingPdfException");
    }
}

class UnexpectedResponseException extends BaseException {
    constructor(msg, status) {
        super(msg, "UnexpectedResponseException");
        this.status = status;
    }
}

export {
    DEFAULT_SCALE_VALUE,
    DEFAULT_SCALE,
    DEFAULT_SCALE_DELTA,
    MIN_SCALE,
    MAX_SCALE,
    UNKNOWN_SCALE,
    MAX_AUTO_SCALE,
    SCROLLBAR_PADDING,
    VERTICAL_PADDING,
    DEFAULT_CACHE_SIZE,

    RenderingStates,
    RendererType,
    TextLayerMode,
    ScrollMode,
    PresentationModeState,
    SpreadMode,

    UnknownErrorException,
    InvalidPdfException,
    MissingPdfException,
    UnexpectedResponseException
};