import "./vendors/pdf.min.js?v=1.0.3.0";
import "./vendors/pdf.worker.min.js?v=1.0.3.0";
document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", "<link rel=\"stylesheet\" href=\"_content/Blazorise.PdfViewer/vendors/pdf_viewer.min.css?v=1.0.3.0\" />");
document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", "<link rel=\"stylesheet\" href=\"_content/Blazorise.PdfViewer/pdfviewer.css?v=1.0.3.0\" />");

pdfjsLib.GlobalWorkerOptions.workerSrc = '_content/Blazorise.PdfViewer/vendors/pdf.worker.min.js';

import { getRequiredElement, focus } from "../Blazorise/utilities.js?v=1.0.3.0";

const _instances = [];

export function initialize(dotNetObjectRef, element, elementId, options) {
    element = getRequiredElement(element, elementId);

    if (!element) {
        return;
    }

    const instance = {
        dotNetObjectRef: dotNetObjectRef,
        element: element,
        elementId: elementId,
        pageNum: options.pageNum || 1,
        pageNums: [],
        pageRendering: false,
        pageNumPending: null,
        options: options
    };

    _instances[elementId] = instance;

    loadPdf(instance, options.source, 1);
}

export function destroy(element, elementId) {
    const instance = _instances[elementId];

    if (instance) {
        if (instance.loadingTask) {
            instance.loadingTask.destroy();
        }

        delete _instances[elementId];
    }
}

export function setSource(elementId, source) {
    element = getRequiredElement(element, elementId);

    if (!element) {
        return;
    }

    const instance = _instances[element.id];

    if (instance) {
        loadPdf(instance, source, 1);
    }
}

function loadPdf(instance, source, pageNum) {
    if (instance.loadingTask) {
        instance.loadingTask.destroy();
    }

    instance.loadingTask = pdfjsLib.getDocument({ url: source });

    instance.loadingTask.promise.then(function (pdf) {
        instance.pdf = pdf;
        instance.pageNum = pageNum;
        instance.numPages = pdf.numPages;
        instance.pages = Array(pdf.numPages).fill({ pageRendering: false, pending: false });
        instance.pendingPages = [];

        if (instance.options.pageTransition === "continuous") {
            for (let i = 1; i <= pdf.numPages; i++) {
                getOrAddPageElement(instance, i);
            }
        }

        if (instance.dotNetObjectRef) {
            instance.dotNetObjectRef.invokeMethodAsync('NotifyPageCount', pdf.numPages);
        }

        generateEmptyPage(instance, pageNum);
    });
}

function respondToVisibility(element, callback) {
    var options = {
        root: document.documentElement,
    };

    var observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            callback(entry.intersectionRatio > 0);
        });
    }, options);

    observer.observe(element);
}

function getOrAddPageElement(instance, pageNum) {
    let pageElement = instance.options.pageTransition === "continuous"
        ? instance.element.querySelector('div[data-page-number="' + pageNum + '"]')
        : instance.element.querySelector('div[data-page-number]');

    if (!pageElement) {
        pageElement = document.createElement('div');

        pageElement.dataset.pageNumber = pageNum;
        pageElement.dataset.loaded = false;
        pageElement.classList.add("b-pdf-page");
        instance.element.appendChild(pageElement);

        const canvasElement = document.createElement('canvas');
        canvasElement.classList.add("b-pdf-page-canvas");
        pageElement.appendChild(canvasElement);

        if (instance.options.selectable) {
            const textLayerElement = document.createElement('div');
            textLayerElement.classList.add("b-pdf-page-text-layer");
            textLayerElement.classList.add("textLayer");
            pageElement.appendChild(textLayerElement);
        }
    }

    if (pageElement && instance.options.pageTransition !== "continuous") {
        pageElement.dataset.pageNumber = pageNum;
    }

    return pageElement;
}

function getPageElement(instance, pageNum) {
    return instance.element.querySelector('div[data-page-number="' + pageNum + '"]');
}

function getVisiblePageElement(instance) {
    let pageElements = instance.element.querySelectorAll('div > .b-pdf-page');

    for (const pageElement of pageElements) {
        if (pageElement && isVisible(pageElement)) {
            return pageElement;
        }
    }

    return null;
}

function clearAllPageElements(instance) {
    let pageElements = instance.element.querySelectorAll('div > .b-pdf-page');

    if (pageElements) {
        pageElements.forEach(pageElement => {
            const canvasElement = pageElement.querySelector('canvas.b-pdf-page-canvas');

            if (canvasElement) {
                const context = canvasElement.getContext('2d');
                context.clearRect(0, 0, canvasElement.width, canvasElement.height);
            }

            if (instance.options.selectable) {
                const textLayerElement = pageElement.querySelector('div.b-pdf-page-text-layer');

                if (textLayerElement) {
                    textLayerElement.innerHtml = "";
                }
            }

            pageElement.dataset.loaded = false;
        });
    }
}

function generateEmptyPage(instance, pageNum) {
    instance.pages[pageNum - 1].pageRendering = true;

    instance.pdf.getPage(pageNum).then(function (page) {
        const viewport = page.getViewport({ scale: instance.options.scale });

        const pageElement = getOrAddPageElement(instance, pageNum);

        if (pageElement) {
            pageElement.style.height = viewport.height + 'px';
            pageElement.style.width = viewport.width + 'px';

            const canvasElement = pageElement.querySelector('canvas.b-pdf-page-canvas');

            if (canvasElement) {
                canvasElement.height = viewport.height;
                canvasElement.width = viewport.width;

                if (instance.options.selectable) {
                    const textLayerElement = pageElement.querySelector('div.b-pdf-page-text-layer');

                    if (textLayerElement) {
                        textLayerElement.style.left = canvasElement.offsetLeft + 'px';
                        textLayerElement.style.top = canvasElement.offsetTop + 'px';
                        textLayerElement.style.height = canvasElement.offsetHeight + 'px';
                        textLayerElement.style.width = canvasElement.offsetWidth + 'px';
                    }
                }
            }

            respondToVisibility(pageElement, (visible) => {
                if (visible && pageElement.dataset.loaded === "false") {
                    queueRenderPage(instance, pageNum);
                }
            });

            if (instance.options.pageTransition === "continuous") {
                instance.pageNums.push(pageNum);

                let nextPageNum = pageNum + 1;
                if (nextPageNum <= instance.numPages) {
                    generateEmptyPage(instance, nextPageNum);
                }
            }
        }
    }).then(function () {
        instance.pages[pageNum - 1].pageRendering = false;
    });
}

function renderPage(instance, pageNum) {
    const pageIndex = pageNum - 1;

    instance.pages[pageIndex].pageRendering = true;

    instance.pdf.getPage(pageNum).then(function (page) {
        const viewport = page.getViewport({ scale: instance.options.scale });

        const pageElement = getOrAddPageElement(instance, pageNum);

        if (pageElement) {
            pageElement.style.height = viewport.height + 'px';
            pageElement.style.width = viewport.width + 'px';

            const canvasElement = pageElement.querySelector('canvas.b-pdf-page-canvas');

            if (canvasElement) {
                const canvasContext = canvasElement.getContext("2d");

                canvasElement.height = viewport.height;
                canvasElement.width = viewport.width;

                const renderContext = {
                    canvasContext: canvasContext,
                    viewport: viewport
                };

                let renderTask = page.render(renderContext).promise;

                if (instance.options.selectable) {
                    instance.pages[pageIndex].pageRendering = true;

                    const textLayerElement = pageElement.querySelector('div.b-pdf-page-text-layer');

                    if (textLayerElement) {
                        renderTask = renderTask.then(function () {
                            return page.getTextContent();
                        }).then(function (textContent) {
                            textLayerElement.style.left = canvasElement.offsetLeft + 'px';
                            textLayerElement.style.top = canvasElement.offsetTop + 'px';
                            textLayerElement.style.height = canvasElement.offsetHeight + 'px';
                            textLayerElement.style.width = canvasElement.offsetWidth + 'px';

                            // Pass the data to the method for rendering of text over the pdf canvas.
                            pdfjsLib.renderTextLayer({
                                textContent: textContent,
                                container: textLayerElement,
                                viewport: viewport,
                                textDivs: []
                            });
                        }).then(function () {
                            instance.pages[pageIndex].pageRendering = false;
                        });
                    }
                }

                renderTask.then(function () {
                    if (instance.pendingPages && instance.pendingPages.length > 0) {
                        const pageNumPending = instance.pendingPages.shift();
                        renderPage(instance, pageNumPending);
                    }
                }).then(function () {
                    instance.pages[pageIndex].pageRendering = false;
                    pageElement.dataset.loaded = true;

                    if (instance.dotNetObjectRef) {
                        instance.dotNetObjectRef.invokeMethodAsync('NotifyPage', pageNum);
                    }
                });
            }
        }
    });
}

function queueRenderPage(instance, pageNum) {
    if (instance.pages[pageNum - 1].pageRendering) {
        instance.pendingPages.push(pageNum);
    } else {
        renderPage(instance, pageNum);
    }
}

export function prevPage(element, elementId) {
    element = getRequiredElement(element, elementId);

    if (!element) {
        return;
    }

    const instance = _instances[element.id];

    if (instance) {
        if (instance.pageNum <= 1) {
            return;
        }

        if (instance.options.pageTransition === "continuous") {
            const prevPageNum = instance.pageNum - 1;

            const pageElement = getPageElement(instance, prevPageNum)

            if (pageElement) {
                pageElement.scrollIntoView(false);
                instance.pageNum = prevPageNum;
            }
        }
        else {
            instance.pageNum--;
            queueRenderPage(instance, instance.pageNum);
        }
    }
}

export function nextPage(element, elementId) {
    element = getRequiredElement(element, elementId);

    if (!element) {
        return;
    }

    const instance = _instances[element.id];

    if (instance) {
        if (instance.pageNum >= instance.pdf.numPages) {
            return;
        }

        if (instance.options.pageTransition === "continuous") {
            const nextPageNum = instance.pageNum + 1;

            const pageElement = getPageElement(instance, nextPageNum)

            if (pageElement) {
                pageElement.scrollIntoView(false);
                instance.pageNum = nextPageNum;
            }
        } else {
            instance.pageNum++;
            queueRenderPage(instance, instance.pageNum);
        }
    }
}

export function zoomIn(element, elementId, scale) {
    element = getRequiredElement(element, elementId);

    if (!element) {
        return;
    }

    const instance = _instances[element.id];

    if (instance) {
        instance.options.scale += scale;

        clearAllPageElements(instance);
        generateEmptyPage(instance, instance.pageNum);

        let pageElements = instance.element.querySelectorAll('div > .b-pdf-page');

        if (pageElements) {
            pageElements.forEach(pageElement => {
                if (pageElement && isVisible(pageElement)) {
                    const pageNum = parseInt(pageElement.dataset.pageNumber);

                    queueRenderPage(instance, pageNum);
                }
            });
        }
    }
}

export function zoomOut(element, elementId, scale) {
    element = getRequiredElement(element, elementId);

    if (!element) {
        return;
    }

    const instance = _instances[element.id];

    if (instance) {
        instance.options.scale -= scale;

        clearAllPageElements(instance);
        generateEmptyPage(instance, instance.pageNum);

        let pageElements = instance.element.querySelectorAll('div > .b-pdf-page');

        if (pageElements) {
            pageElements.forEach(pageElement => {
                if (pageElement && isVisible(pageElement)) {
                    const pageNum = parseInt(pageElement.dataset.pageNumber);

                    queueRenderPage(instance, pageNum);
                }
            });
        }
    }
}

function isVisible(elem) {
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
    const style = getComputedStyle(elem);
    if (style.display === 'none') return false;
    if (style.visibility !== 'visible') return false;
    if (style.opacity < 0.1) return false;
    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false;
    }
    const elemCenter = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
    };
    if (elemCenter.x < 0) return false;
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
    if (elemCenter.y < 0) return false;
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
    do {
        if (pointContainer === elem) return true;
    } while (pointContainer = pointContainer.parentNode);
    return false;
}