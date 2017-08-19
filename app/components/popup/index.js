import mediator from '../mediator';

class Popup {

    constructor(domNode, userName) {
        this._domNode = domNode;
        this._innerDiv = domNode.querySelector('.popup-background');
        this._userName = userName;
        this._showDuration = 2000;
        this._popupShowStyle = 'popup-show';

        this._lockStatus = {
            tryLock: '<p class="popup-label">' + this._userName
                + ': захват управления...</p>',
            lockAccepted: '<p class="popup-label">Успешный захват'
                + 'управления!</p>',
            lockDenied: '<p class="popup-label">Захват управления не'
                + ' удался!</p>',
        };

        this._labelStyle = {
            tryLock: 'popup-try-lock',
            lockAccepted: 'popup-lock-accepted',
            lockDenied: 'popup-lock-denied',
        };

        this._timerId = null;

        this._hide = this._hidePopup.bind(this);

        mediator.on('canvas:lock', this.lockStatusHandler.bind(this));
        mediator.on('lock:*', this.lockStatusHandler.bind(this));
    }

    _resetDeferred() {
        if (this._timerId) {
            clearTimeout(this._timerId);
        }

        this._timerId = null;
    }

    _setClass(className, nodeToModify, classContainer) {
        if (!nodeToModify.classList.contains(className)) {
            if (classContainer !== 'undefined') {
                for (let prop in classContainer) {
                    nodeToModify.classList.remove(classContainer[prop]);
                }
            }

            nodeToModify.classList.add(className);
        }
    }

    _showPopup() {
        this._domNode.classList.add(this._popupShowStyle);
        this._timerId = setTimeout(this._hide, this._showDuration);
    }

    _hidePopup() {
        this._domNode.classList.remove(this._popupShowStyle);
        this._resetDeferred();
    }
    
    lockStatusHandler(data, type) {
    	const parsedType = type.split(':');
        let typeHandler = 'tryLock';
        
        //if event type name is 'lock:[accept/denied]'
        if (parsedType[0] !== 'canvas') {
            typeHandler = (parsedType[1] === 'accept') ? 'lockAccepted'
                : 'lockDenied';
        }
        
        if (!!this._timerId) {
            this._resetDeferred();
        }

        this._innerDiv.innerHTML = this._lockStatus[typeHandler];
        this._setClass(this._labelStyle[typeHandler], this._innerDiv, this._labelStyle);

        this._showPopup();
    }
};

export default Popup;
