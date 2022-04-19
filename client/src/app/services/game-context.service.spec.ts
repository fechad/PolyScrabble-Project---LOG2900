import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { IoWrapper } from '@app/classes/socket-wrapper';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';
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

    it('should not update when characters not in rack', () => {
        service.rack.next([{ name: 'a', score: 1 }]);
        const beforeRack = service.rack.value;
        expect(() => service.attemptTempRackUpdate('ab')).toThrowError();
        expect(beforeRack).toEqual(service.rack.value);
    });

    it('should throw when characters not in rack', () => {
        service.rack.next([{ name: 'a', score: 1 }]);
        expect(() => service.attemptTempRackUpdate('ab')).toThrowError();
    });

    it('should not throw when upper case characters and * in rack', () => {
        service.rack.next([{ name: '*', score: 0 }]);
        expect(() => service.attemptTempRackUpdate('M')).not.toThrowError();
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

    it('should place letters', () => {
        const updateRack = spyOn(service, 'tempUpdateRack');
        const allowSwitch = spyOn(service, 'allowSwitch');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        service.place('allo', 7, 7, true);
        expect(updateRack).toHaveBeenCalled();
        expect(allowSwitch).toHaveBeenCalledWith(false);
    });

    it('should fire sweet alert when server is down', fakeAsync(() => {
        const fireSpy = spyOn(Swal, 'fire');
        const serviceMock = new GameContextService();
        const prototype = Object.getPrototypeOf(serviceMock);
        prototype.serverDownAlert();

        expect(fireSpy).toHaveBeenCalled();
        flush();
    }));

    it('should call serverDownAlert when socket is disconnected', () => {
        const io = new IoWrapper();
        const socket: Socket = io.io(`${environment.socketUrl}/games/0`, { auth: AuthService.getAuth() });
        service.init(socket);
        const serviceMock = new GameContextService();
        const prototype = Object.getPrototypeOf(serviceMock);
        const serverDownSpy = spyOn(prototype, 'serverDownAlert');
        service.hint();
        // get private attribute
        // eslint-disable-next-line dot-notation
        service['socket']?.disconnect();
        expect(serverDownSpy).toHaveBeenCalled();
    });

    it('should call clearMessages when close', () => {
        const clearMessagesSpy = spyOn(service, 'clearMessages');
        service.close();

        expect(clearMessagesSpy).toHaveBeenCalled();
    });

    it('should be true', () => {
        service.allowSwitch(true);
        expect(service.skipTurnEnabled).toEqual(true);
    });
});
