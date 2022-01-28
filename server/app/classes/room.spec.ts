import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { Parameters } from './parameters';
import { Room } from './room';

// For to.be.undefined for chai
/* eslint-disable @typescript-eslint/no-unused-expressions,no-unused-expressions */

describe('Room', () => {
    let parameters: Parameters;
    let room: Room;
    let stub: sinon.SinonSpy;

    beforeEach(async () => {
        parameters = new Parameters();
        stub = sinon.stub();
        room = new Room(0, 'DummyPlayerId', 'Dummy', parameters, stub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should check if has other player', (done) => {
        assert(!room.hasOtherPlayer());
        const result = room.addPlayer('NotDummyId', 'NotDummy');
        expect(result).to.be.undefined;
        assert(room.hasOtherPlayer());
        done();
    });

    it('should not add a player with same name', (done) => {
        const result = room.addPlayer('Rumumumumu', 'Dummy');
        expect(result).to.not.be.undefined;
        done();
    });

    it('should not add a player with same name', (done) => {
        const result = room.addPlayer('Rumumumumu', 'Dummy');
        expect(result).to.not.be.undefined;
        done();
    });

    it('should not add a player with same ID', (done) => {
        const result = room.addPlayer('DummyPlayerId', 'NotDummy');
        expect(result).to.not.be.undefined;
        done();
    });

    it('should not add more than 1 player', (done) => {
        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        const result2 = room.addPlayer('NotNotDummyPlayerId', 'NotNotDummy');
        expect(result2).to.not.be.undefined;
        done();
    });

    it('should add player', (done) => {
        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        done();
    });

    it('should kick player', (done) => {
        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.kickOtherPlayer();
        // eslint-disable-next-line dot-notation
        expect(room['otherPlayer']).to.be.undefined;
        done();
    });

    it('should not error when there is no player to kick', (done) => {
        room.kickOtherPlayer();
        // eslint-disable-next-line dot-notation
        expect(room['otherPlayer']).to.be.undefined;
        done();
    });

    it('should send event when kicking player', (done) => {
        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.kickOtherPlayer();
        // eslint-disable-next-line dot-notation
        expect(room['otherPlayer']).to.be.undefined;
        assert(stub.calledWith('kick', null));
        done();
    });

    it('should stop the game when the main player quits', (done) => {
        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.quit('DummyPlayerId');
        assert(stub.calledWith('delete', null));
        done();
    });

    it('should ignore random players trying to quit', (done) => {
        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.quit('RandomId');
        assert(stub.notCalled);
        done();
    });

    it('should remove the other player when they quit', (done) => {
        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.quit('NotDummyPlayerId');
        // eslint-disable-next-line dot-notation
        expect(room['otherPlayer']).to.be.undefined;
        assert(stub.calledWith('left', null));
        done();
    });

    it('should let someone else join after they quit', (done) => {
        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.quit('NotDummyPlayerId');
        // eslint-disable-next-line dot-notation
        expect(room['otherPlayer']).to.be.undefined;
        assert(stub.calledWith('left', null));
        const result2 = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result2).to.be.undefined;
        done();
    });

    it('should let someone else join after someone else quit', (done) => {
        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.quit('NotDummyPlayerId');
        // eslint-disable-next-line dot-notation
        expect(room['otherPlayer']).to.be.undefined;
        assert(stub.calledWith('left', null));
        const result2 = room.addPlayer('NotNotDummyPlayerId', 'NotNotDummy');
        expect(result2).to.be.undefined;
        done();
    });
});
