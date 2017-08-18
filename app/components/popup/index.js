import mediator from '../mediator';

class Popup {

    constructor(domNode) {
        this._domNode = domNode;
        this._styles = {
            tryLock: {
                message: '<p id="popupLabel">Trying to lock...</p>',
                background: '#0099ff',
            },

            lockAccepted: {
                message: '<p id="popupLabel">Lock accepted!</p>',
                background: '#4ff963',
            },

            lockDenied: {
                message: '<p id="popupLabel">Lock denied!</p>',
                background: '#f94f4f',
            },
        };

        this._transition = {
            default: {
                transitionProperty: 'top',
                transitionDuration: '1s',
                transitionTimingFunction: 'ease',
            },

            changeLabelStyle: {
                transitionProperty: 'background-color',
                transitionDuration: '0.5s',
                transitionTimingFunction: 'ease',
            },
        };

        this._hide = this._hidePopup.bind(this);

        mediator.on('canvas:lock', this.tryLock.bind(this));
        mediator.on('canvas:lock:accept', this.acceptLock.bind(this));
        mediator.on('canvas:lock:denied', this.denyLock.bind(this));
    }

    _setStyles(mode) {
        this._domNode.innerHTML = this._styles[mode].message;
        this._domNode.style.backgroundColor = this._styles[mode].background;
    }

    _setTransitionProp(mode) {
        this._domNode.style.transitionProperty = this._transition[mode]
            .transitionProperty;

        this._domNode.style.transitionDuration = this._transition[mode]
            .transitionDuration;

        this._domNode.style.transitionTimingFunction = this._transition[mode]
            .transitionTimingFunction;
    }

    _showPopup() {
        this._domNode.style.top = '0';
    }

    _hidePopup() {
        this._setTransitionProp('default');
        this._domNode.style.top = '-70px';
    }

    tryLock() {
        this._setTransitionProp('default');
        this._setStyles('tryLock');
        this._showPopup();
    }

    acceptLock() {
        this._setTransitionProp('changeLabelStyle');
        this._setStyles('lockAccepted');

        setTimeout(this._hide, 2000);
    }

    denyLock() {
        this._setTransitionProp('changeLabelStyle');
        this._setStyles('lockDenied');

        setTimeout(this._hide, 2000);
    }
}

export default Popup;