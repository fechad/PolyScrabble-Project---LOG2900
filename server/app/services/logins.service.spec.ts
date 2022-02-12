import { assert, expect } from 'chai';
import { LoginsService } from './logins.service';

describe('Logins service', () => {
    const SOCKET_ID = 'socketId';

    let loginsService: LoginsService;

    beforeEach(() => {
        loginsService = new LoginsService();
    });
    it('should be created', () => {
        assert(loginsService !== undefined);
    });
    it('should login a user with no id', () => {
        const [id, token] = loginsService.login(undefined, SOCKET_ID);
        expect(id).to.equal(SOCKET_ID);
        assert(loginsService.verify(id, token));
    });
    it('should login a user with wrong id using the default one', () => {
        const [id, token] = loginsService.login('I do not exist', SOCKET_ID);
        expect(id).to.equal(SOCKET_ID);
        assert(loginsService.verify(id, token));
    });
    it('should login a duplicate user using the default id', () => {
        const [id, token] = loginsService.login(undefined, SOCKET_ID);
        assert(loginsService.verify(id, token));
        const [otherId, otherToken] = loginsService.login(id, `${SOCKET_ID}-bis`);
        assert(loginsService.verify(otherId, otherToken));
        expect(id).not.to.equal(otherId);
    });
    it('should not verify a logged out user', () => {
        const [id, token] = loginsService.login(undefined, SOCKET_ID);
        assert(loginsService.verify(id, token));
        loginsService.logout(id);
        assert(!loginsService.verify(id, token));
    });
    it('should allow reconnections', () => {
        const [id, token] = loginsService.login(undefined, SOCKET_ID);
        assert(loginsService.verify(id, token));
        loginsService.logout(id);
        assert(!loginsService.verify(id, token));
        const [newId, newToken] = loginsService.login(id, `${SOCKET_ID}-bis2`);
        expect(newId).to.equal(id);
        assert(loginsService.verify(id, newToken));
        assert(!loginsService.verify(id, token));
    });
    it('should not allow reconnections after 5s', (done) => {
        const [id, token] = loginsService.login(undefined, SOCKET_ID);
        assert(loginsService.verify(id, token));
        loginsService.logout(id);
        assert(!loginsService.verify(id, token));
        setTimeout(() => {
            const [newId, newToken] = loginsService.login(id, `${SOCKET_ID}-bis3`);
            expect(newId).to.not.equal(id);
            assert(loginsService.verify(newId, newToken));
            assert(!loginsService.verify(id, token));
            assert(!loginsService.verify(id, newToken));
            assert(!loginsService.verify(newId, token));
            done();
        }, 5100);
    });
});
