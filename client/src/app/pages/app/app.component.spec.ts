import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Parameters } from '@app/classes/parameters';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CommunicationService } from '@app/services/communication.service';

describe('AppComponent', () => {
    const ROOM = {
        id: 0,
        name: 'Trantor',
        parameters: new Parameters(),
        mainPlayer: {
            id: 'Gaals ID',
            name: 'Gaal',
            connected: true,
        },
        otherPlayer: undefined,
        started: false,
    };

    let router: jasmine.SpyObj<Router>;
    let communicationService: CommunicationService;
    let app: AppComponent;

    beforeEach(async () => {
        router = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            imports: [AppRoutingModule, RouterTestingModule.withRoutes(routes), HttpClientTestingModule],
            declarations: [AppComponent],
            providers: [{ provide: Router, useValue: router }],
        }).compileComponents();
        communicationService = TestBed.inject(CommunicationService);
        const fixture = TestBed.createComponent(AppComponent);
        app = fixture.componentInstance;
        router.navigate.calls.reset();
    });

    it('should create the app', () => {
        expect(app).toBeTruthy();
    });

    it('should redirect the app when the user is already included', () => {
        communicationService.selectedRoom.next(ROOM);
        expect(router.navigate).toHaveBeenCalledOnceWith(['/waiting-room']);
    });

    it('should redirect the app when the room is started', () => {
        communicationService.selectedRoom.next({ ...ROOM, started: true });
        expect(router.navigate).toHaveBeenCalledOnceWith(['/game']);
    });

    it('should redirect the app when the room is undefined', () => {
        communicationService.selectedRoom.next(ROOM);
        router.navigate.calls.reset();
        communicationService.selectedRoom.next(undefined);
        expect(router.navigate).toHaveBeenCalled();
    });

    it('should redirect the app when the room is no longer started', () => {
        communicationService.selectedRoom.next({ ...ROOM, started: true });
        expect(router.navigate).toHaveBeenCalledWith(['/game']);
        router.navigate.calls.reset();
        communicationService.selectedRoom.next(ROOM);
        expect(router.navigate).toHaveBeenCalledWith(['/waiting-room']);
    });

    it('should not redirect when not updating room', () => {
        communicationService.selectedRoom.next(ROOM);
        router.navigate.calls.reset();
        communicationService.selectedRoom.next({ ...ROOM, otherPlayer: { id: 'Hari Seldons ID', name: 'Hari Seldon', connected: true } });
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not redirect when not updating undefined room', () => {
        communicationService.selectedRoom.next(undefined);
        router.navigate.calls.reset();
        communicationService.selectedRoom.next(undefined);
        expect(router.navigate).not.toHaveBeenCalled();
    });
});
