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

    it('should place letters', () => {
        const updateRack = spyOn(service.rack, 'tempUpdate');
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
