class Mediator {
    constructor() {
        // @fixme remove `console.log`
        // eslint-disable-next-line
        console.log('"Mediator" created');
    }
    
    on(type, listener) {
        // @fixme remove `console.log`
        // eslint-disable-next-line
        console.log('mediator.on', type, listener)
    }

    emit(type, ...args) {
        // @fixme remove `console.log`
        // eslint-disable-next-line
        console.log('mediator.emit', type, args)
    }
}

// kind of Singleton pattern
export default new Mediator();
