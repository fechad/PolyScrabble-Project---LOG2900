import { TestBed } from '@angular/core/testing';
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
