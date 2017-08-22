import './style.css';
import mediator from '../mediator';

class Chat {
    constructor(domNode) {
        this._domNode = domNode;

        this._text = document.createElement('div');
        this._domNode.appendChild(this._text);

        this._form = document.createElement('form');
        this._domNode.appendChild(this._form);

        this._input = document.createElement('input');
        this._input.type = 'text';
        this._input.value = '';
        this._form.appendChild(this._input);

        this._submit = document.createElement('input');
		this._submit.type = 'submit';
		this._submit.value = 'submit';
		this._submit.addEventListener('click', this._send.bind(this));
        this._form.appendChild(this._submit);

        mediator.on('conference:sync', this._getUserName.bind(this));
        mediator.on('chat:message', this._addMessage.bind(this));
    }

    hide() {
        this._domNode.classList.add('hide');
    }

    show() {
        this._domNode.classList.remove('hide');
    }

    _addMessage(payload) {
        const newMessage = document.createElement('div');
        newMessage.className = 'message';
        this._text.appendChild(newMessage);

        const userName = document.createElement('span');
        userName.innerHTML = `${payload.userName}: `;
        newMessage.appendChild(userName);

        const time = document.createElement('span');
        const date = new Date;
        time.innerHTML = `${date.toLocaleString()}: `;
        newMessage.appendChild(time);

        const message = document.createElement('span');
        message.innerHTML = payload.message;
        newMessage.appendChild(message);
    }

    _send(event) {
        event.preventDefault();
        
        if (this._input.value === '') {
            return;
        }
        
        const payload = {};
        payload.userName = this.userName;
        payload.message = this._input.value;
        mediator.emit('chat:message', payload);
        this._input.value = '';
    }
    	
	_getUserName(obj) {
		this.userName = obj.userList[obj.userList.length - 1].name;
	}
}

export default Chat;
