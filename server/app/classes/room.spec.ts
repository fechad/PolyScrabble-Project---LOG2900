import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { Parameters } from './parameters';
import { Room } from './room';

// For to.be.undefined for chai
/* eslint-disable @typescript-eslint/no-unused-expressions,no-unused-expressions */

describe('Room', () => {
    let parameters: Parameters;
    let room: Room;

    beforeEach(async () => {
        parameters = new Parameters();
        room = new Room(0, 'DummyPlayerId', 'Dummy', parameters);
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
        expect(room.getOtherPlayer()).to.be.undefined;
        done();
    });

    it('should not error when there is no player to kick', (done) => {
        room.kickOtherPlayer();
        expect(room.getOtherPlayer()).to.be.undefined;
        done();
    });

    it('should send event when kicking player', (done) => {
        const stub = sinon.stub();
        room.events.on('kick', stub);

        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.kickOtherPlayer();
        expect(room.getOtherPlayer()).to.be.undefined;
        assert(stub.called);
        done();
    });

    it('should stop the game when the main player quits', (done) => {
        const stub = sinon.stub();
        room.events.on('kick', stub);

        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.quit(true);
        assert(stub.called);
        done();
    });

    it('should remove the other player when they quit', (done) => {
        const stub = sinon.stub();
        room.events.on('updateRoom', stub);

        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.quit(false);
        expect(room.getOtherPlayer()).to.be.undefined;
        assert(stub.called);
        done();
    });

    it('should let someone join after they quit', (done) => {
        const stub = sinon.stub();
        room.events.on('updateRoom', stub);

        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.quit(false);
        expect(room.getOtherPlayer()).to.be.undefined;
        assert(stub.called);
        const result2 = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result2).to.be.undefined;
        done();
    });

    it('should let someone else join after someone else quit', (done) => {
        const stub = sinon.stub();
        room.events.on('updateRoom', stub);

        const result = room.addPlayer('NotDummyPlayerId', 'NotDummy');
        expect(result).to.be.undefined;
        room.quit(false);
        expect(room.getOtherPlayer()).to.be.undefined;
        assert(stub.called);
        const result2 = room.addPlayer('NotNotDummyPlayerId', 'NotNotDummy');
        expect(result2).to.be.undefined;
        done();
    });
});
