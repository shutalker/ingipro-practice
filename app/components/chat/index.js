import './style.css';
import mediator from '../mediator';

class Chat {
    constructor(domNode) {
        this._domNode = domNode;

        this.userName = 'testName'; //TODO get user name

        this._text = this._domNode.createElement('div');
        this._domNode.appendChild(this._text);

        this._form = this._domNode.createElement('form');
        this._form.onsubmit = this._send;
        this._domNode.appendChild(this._form);

        this._input = this._domNode.createElement('input');
        this._input.type = 'text';
        this._input.id = 'input';
        this._form.appendChild(this._input);

        this._submit = this._domNode.createElement('submit');
        this._form.appendChild(this._submit);

        this._send.bind(this);
        mediator.on('chat:message', this._addMessage.bind(this));
    }

    hide() {
        this._domNode.classList.add('hide');
    }

    show() {
        this._domNode.classList.remove('hide');
    }

    _addMessage(item) {
        const newMessage = this._domNode.createElement('div');
        newMessage.className = 'message';
        this._text.appendChild(newMessage);

        const userName = this._domNode.createElement('div');
        userName.innerHTML = '${item.userName}: ';
        newMessage.appendChild(userName);

        const time = this._domNode.createElement('div');
        time.innerHTML = '${new Date.toLocaleString()}: ';
        newMessage.appendChild(time);

        const message = this._domNode.createElement('div');
        message.innerHTML = item.message;
        newMessage.appendChild(message);
    }

    _send() {
        const input = this._domNode.getElementById('input');
        const message = {};
        message.userName = this.userName;
        message.message = input.value;
        mediator.emit('chat:message', message);
        input.value = '';
    }
}

export default Chat;
