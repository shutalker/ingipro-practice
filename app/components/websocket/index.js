'use strict';

import io from 'socket.io-client';
import Mediator from '../mediator';

class WebSocket {
    constructor() {
        this._socket = io.connect();

        this._socket.on( 'main', this.socketEmitMediator.bind(this) )                           //Recv from Server

        Mediator.on('*', this.socketOnMediator.bind(this));
    }

    socketOnMediator(data, type) {
        this._socket.emit('main', { type, payload: data } );                                    //Send on Server
    }

    socketEmitMediator(data) {
        Mediator.emit(data.type, data.payload);
    }
}
// kind of Singleton pattern
export default new WebSocket();
