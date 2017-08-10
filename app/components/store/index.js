class Store {
    constructor() {
        // @fixme remove `console.log`
        // eslint-disable-next-line
        console.log('"Store" created');
    }
}

// kind of Singleton pattern
export default new Store();
