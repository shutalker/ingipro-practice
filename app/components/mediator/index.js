'use strict';

class Mediator {
    constructor() {
        this._listeners = {};
    }

    on(type, listener) {
        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    }

    off(type, listener) {
        if (this._listeners[type]) {
            for (let i = 0; i < this._listeners[type].length; i++) {
                if(this._listeners[type][i] === listener) {
                    this._listeners[type].splice(i, 1);
                }
            }
        }
    }

    emit(type, ...args) {
        let sliceChar = type.slice( 0, type.indexOf(':') ) + ': *';

        const data = { type, payload: args }

        if ( this._listeners[ sliceChar ] ) {
            this._listeners[sliceChar].forEach( listener => listener.call(null, data) );
        }

        if (this._listeners['*']) {                                                         //Это, как я понял, означает, что если какой-то слушатель (к примеру Сокеты) подписан на все события, то при любом событии сокеты тоже обрабатывают его
            this._listeners['*'].forEach( listener => listener.call(null, data) );
        }

        if (!this._listeners[type]) {
            return;
        }

        this._listeners[type].forEach( listener => listener.call(null, data) );
    }

}

export default new Mediator();
