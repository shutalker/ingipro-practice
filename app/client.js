import Layout from 'components/layout';
import Login from 'components/login';
import Users from 'components/users';
import Chat from 'components/chat';
import mediator from 'components/mediator'; // instance of component
import Popup from 'components/popup';
import 'components/store';
import 'components/voice';
import 'components/websocket';

// create instanses of ui components
const layout = new Layout(document.querySelector('.layout'));
const login = new Login(document.querySelector('.login'));
const users = new Users(document.querySelector('.users'));
const popup = new Popup(document.querySelectorAll('.popup-locker'));
const chat = new Chat(document.querySelector('.chat'));

// init, show login form
login.show();

// wait to login
mediator.on('user:logged', () => {
    login.hide();
    layout.show();
    users.show();
    chat.show();
});
