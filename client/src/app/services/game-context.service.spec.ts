import { TestBed } from '@angular/core/testing';
import { Letter } from '@app/classes/letter';
import { GameContextService } from './game-context.service';

describe('GameContextService', () => {
    let service: GameContextService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameContextService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should not update when removing weird characters', () => {
        const beforeRack = service.rack.value;
        service.tempUpdateRack('*');
        expect(beforeRack).toEqual(service.rack.value);
        service.tempUpdateRack('b*»)/');
        expect(beforeRack).toEqual(service.rack.value);
        service.tempUpdateRack('ù');
        expect(beforeRack).toEqual(service.rack.value);
    });

    it('should not update when characters not in board', () => {
        service.rack.next([{ name: 'a', score: 1 }]);
        const beforeRack = service.rack.value;
        service.tempUpdateRack('ab');
        expect(beforeRack).toEqual(service.rack.value);
    });

    it('should update the rack', () => {
        const RACK: Letter[] = [
            { name: 'a', score: 1 },
            { name: 'a', score: 1 },
            { name: 'b', score: 3 },
        ];
        const OTHER_RACK_LENGTH = 4;

        service.updateRack(RACK, OTHER_RACK_LENGTH);
        expect(service.rack.value).toBe(RACK);
        expect(service.myRackCount.value).toBe(RACK.length);
        expect(service.opponentRackCount.value).toBe(OTHER_RACK_LENGTH);
    });

    it('should set the score', () => {
        const MY_SCORE = 30;
        const OTHER_SCORE = 50;

        service.setScore(MY_SCORE, true);
        expect(service.myScore.value).toBe(MY_SCORE);
        service.setScore(OTHER_SCORE, false);
        expect(service.opponentScore.value).toBe(OTHER_SCORE);
    });

    it('should set the name', () => {
        const MY_NAME = 'Bob';
        const OTHER_NAME = 'Not Bob';

        service.setName(MY_NAME, true);
        expect(service.myName).toBe(MY_NAME);
        service.setName(OTHER_NAME, false);
        expect(service.opponentName).toBe(OTHER_NAME);
    });

    it('should clear the messages', () => {
        service.messages.next([
            { emitter: 'Obi-wan', text: 'Hello there' },
            { emitter: 'General Grievous', text: 'General Kenobi! You are a bold one' },
        ]);
        service.clearMessages();
        expect(service.messages.value).toEqual([]);
    });

    it('should receive new messages', () => {
        const MESSAGES = [
            { emitter: 'Obi-wan', text: 'Hello there' },
            { emitter: 'General Grievous', text: 'General Kenobi! You are a bold one' },
        ];
        service.receiveMessages(MESSAGES[0], 0, false);
        service.receiveMessages(MESSAGES[1], 0, true);
        expect(service.messages.value).toEqual(MESSAGES);
    });

    it('should receive new messages and remove them from temp', () => {
        const MESSAGES = [
            { emitter: 'Obi-wan', text: 'Hello there' },
            { emitter: 'General Grievous', text: 'General Kenobi! You are a bold one' },
        ];
        service.tempMessages.next([MESSAGES[0].text, MESSAGES[1].text]);
        service.receiveMessages(MESSAGES[0], 0, true);
        expect(service.messages.value).toEqual(MESSAGES.slice(0, 1));
        expect(service.tempMessages.value).toEqual([MESSAGES[1].text]);
        service.receiveMessages(MESSAGES[1], 1, true);
        expect(service.messages.value).toEqual(MESSAGES);
    });
});
