class WebSocket {
    constructor(mediator) {
        this._socket = io.connect();
        this._mediator = mediator;
        console.log('"WebSocket" created');
    }

    socketOnMediator(data) {
        this._socket.emit('main', data);                                    //Send on Server

        this._socket.on( 'main', data => this.socketEmitMediator(data) )    //Recv from Server
    }

    socketEmitMediator(data) {                                              //mediator.emit
        this._mediator.emit(data.type, data.payload);
    }
}
// kind of Singleton pattern
//export default new WebSocket();
