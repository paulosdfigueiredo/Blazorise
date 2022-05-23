const WaitOnType = {
    EVENT: "event",
    TIMEOUT: "timeout",
};

function waitOnEventOrTimeout({ target, name, delay = 0 }) {
    return new Promise(function (resolve, reject) {
        if (
            typeof target !== "object" ||
            !(name && typeof name === "string") ||
            !(Number.isInteger(delay) && delay >= 0)
        ) {
            throw new Error("waitOnEventOrTimeout - invalid parameters.");
        }

        function handler(type) {
            if (target instanceof EventBus) {
                target._off(name, eventHandler);
            } else {
                target.removeEventListener(name, eventHandler);
            }

            if (timeout) {
                clearTimeout(timeout);
            }
            resolve(type);
        }

        const eventHandler = handler.bind(null, WaitOnType.EVENT);
        if (target instanceof EventBus) {
            target._on(name, eventHandler);
        } else {
            target.addEventListener(name, eventHandler);
        }

        const timeoutHandler = handler.bind(null, WaitOnType.TIMEOUT);
        const timeout = setTimeout(timeoutHandler, delay);
    });
}

class EventBus {
    constructor() {
        this._listeners = Object.create(null);
    }

    /**
     * @param {string} eventName
     * @param {function} listener
     * @param {Object} [options]
     */
    on(eventName, listener, options = null) {
        this._on(eventName, listener, {
            external: true,
            once: options?.once,
        });
    }

    /**
     * @param {string} eventName
     * @param {function} listener
     * @param {Object} [options]
     */
    off(eventName, listener, options = null) {
        this._off(eventName, listener, {
            external: true,
            once: options?.once,
        });
    }

    /**
     * @param {string} eventName
     * @param {Object} data
     */
    dispatch(eventName, data) {
        const eventListeners = this._listeners[eventName];
        if (!eventListeners || eventListeners.length === 0) {
            return;
        }
        let externalListeners;
        // Making copy of the listeners array in case if it will be modified
        // during dispatch.
        for (const { listener, external, once } of eventListeners.slice(0)) {
            if (once) {
                this._off(eventName, listener);
            }
            if (external) {
                if (!externalListeners) {
                    externalListeners = [];
                }

                externalListeners.push(listener);

                continue;
            }
            listener(data);
        }
        // Dispatch any "external" listeners *after* the internal ones, to give the
        // viewer components time to handle events and update their state first.
        if (externalListeners) {
            for (const listener of externalListeners) {
                listener(data);
            }
            externalListeners = null;
        }
    }

    /**
     * @ignore
     */
    _on(eventName, listener, options = null) {
        if (!this._listeners[eventName]) {
            this._listeners[eventName] = [];
        }

        const eventListeners = (this._listeners[eventName]);
        eventListeners.push({
            listener,
            external: options?.external === true,
            once: options?.once === true,
        });
    }

    /**
     * @ignore
     */
    _off(eventName, listener, options = null) {
        const eventListeners = this._listeners[eventName];
        if (!eventListeners) {
            return;
        }
        for (let i = 0, ii = eventListeners.length; i < ii; i++) {
            if (eventListeners[i].listener === listener) {
                eventListeners.splice(i, 1);
                return;
            }
        }
    }
}

class AutomationEventBus extends EventBus {
    dispatch(eventName, data) {
        if (typeof PDFJSDev !== "undefined" && !PDFJSDev.test("MOZCENTRAL")) {
            throw new Error("Not implemented: AutomationEventBus.dispatch");
        }
        super.dispatch(eventName, data);

        const details = Object.create(null);
        if (data) {
            for (const key in data) {
                const value = data[key];
                if (key === "source") {
                    if (value === window || value === document) {
                        return; // No need to re-dispatch (already) global events.
                    }
                    continue; // Ignore the `source` property.
                }
                details[key] = value;
            }
        }
        const event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, details);
        document.dispatchEvent(event);
    }
}

export { AutomationEventBus, EventBus, waitOnEventOrTimeout, WaitOnType };