function component() {
    const element = document.createElement('div');

    element.innerHTML = 'Hello webpack from sample2';

    return element;
}

document.body.appendChild(component());
