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
        if ( this._listeners[ sliceChar ] ) {
            this._listeners[sliceChar].forEach( listener => listener.apply(null, args) );
        }

        if (this._listeners['*']) {                                                         //Это, как я понял, означает, что если какой-то слушатель (к примеру Сокеты) подписан на все события, то при любом событии сокеты тоже обрабатывают его
            this._listeners['*'].forEach( listener => listener.apply(null, args) );
        }

        if (!this._listeners[type]) {
            return;
        }

        this._listeners[type].forEach( listener => listener.apply(null, args) );
    }

}

class Hello {
    onHi(text) {
        console.log('Hi', text);
    }
}

class User {
    constructor() {
        this._users = [];
    }
    newUser(name) {
        this._users.push({name: name});
    }
    printUsers() {
        console.log(this._users);
    }
}

let foo = function() {
    console.log('All events');
}

const mediator = new Mediator();
const hello = new Hello();
const users = new User();

users.newUser('Oleg');
users.newUser('Volodya');

mediator.on('*', foo);
mediator.on('user: *', users.printUsers.bind(users));
mediator.emit('user: print', 'Oleg');

mediator.on('helloworld', hello.onHi.bind(hello));
mediator.emit('helloworld', 'Artur');
