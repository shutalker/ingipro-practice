require('./sample.scss');

function component() {
    const element = document.createElement('div');

    element.innerHTML = 'Hello webpack from sample';

    return element;
}

document.body.appendChild(component());
