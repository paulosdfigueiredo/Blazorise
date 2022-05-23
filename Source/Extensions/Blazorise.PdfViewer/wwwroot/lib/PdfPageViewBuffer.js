export class PdfPageViewBuffer {
    constructor(size) {
        this.buf = new Set();
        this.size = size;
    }

    push(view) {
        const buf = this.buf;

        if (buf.has(view)) {
            buf.delete(view); // Move the view to the "end" of the buffer.
        }

        buf.add(view);

        if (buf.size > this.size) {
            this.destroyFirstView();
        }
    }

    resize(newSize, idsToKeep = null) {
        this.size = newSize;

        const buf = this.buf;

        if (idsToKeep) {
            const ii = buf.size;
            let i = 1;
            for (const view of buf) {
                if (idsToKeep.has(view.id)) {
                    buf.delete(view); // Move the view to the "end" of the buffer.
                    buf.add(view);
                }
                if (++i > ii) {
                    break;
                }
            }
        }

        while (buf.size > this.size) {
            this.destroyFirstView();
        }
    }

    has(view) {
        return this.buf.has(view);
    }

    [Symbol.iterator]() {
        return this.buf.keys();
    }

    destroyFirstView() {
        const firstView = this.buf.keys().next().value;

        firstView?.destroy();
        this.buf.delete(firstView);
    }
}