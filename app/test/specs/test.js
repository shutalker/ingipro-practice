const assert = require('chai').assert;

describe('Popup', () => {
    const STATUS_FREE = 'Управление доступно для захвата';
    const TESTNAME = 'testname';

    describe('#showActiveLocker()', () => {
        let lockStatus;

        it('shoud return "Управление: username" on getting event from mediator "conference:lock"', () => {
            browser.url('http://localhost:3000');
            browser.execute((username) => {
                window.mediator.emit('conference:lock', { name: username });
            }, TESTNAME);

            //using getAttribute because of invocation of getText(selector) will return empty string if element's property 'display' is 'none'
            lockStatus = browser.getAttribute('.popup-locker.active-locker > .popup-label', 'innerHTML');

            assert.equal(lockStatus, 'Управление: ' + TESTNAME);
        });

        it('shoud return "Управление доступно для захвата" on getting event from mediator "conference:unlock"', () => {
            browser.url('http://localhost:3000');
            browser.execute(() => {
                window.mediator.emit('conference:unlock', {});
            });

            //using getAttribute because of invocation of getText(selector) will return empty string if element's property 'display' is 'none'
            lockStatus = browser.getAttribute('.popup-locker.active-locker > .popup-label', 'innerHTML');

            assert.equal(lockStatus, STATUS_FREE);
        });
    });

});
