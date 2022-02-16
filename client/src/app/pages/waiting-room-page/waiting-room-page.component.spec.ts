import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Dictionnary } from '@app/classes/dictionnary';
import { Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { BehaviorSubject } from 'rxjs';
import { WaitingRoomPageComponent } from './waiting-room-page.component';

class CommunicationServiceMock {
    selectedRoom: BehaviorSubject<Room> = new BehaviorSubject({
        id: 0,
        name: 'Room',
        parameters: new Parameters(),
        mainPlayer: { name: 'Player 1', id: '0', connected: true },
        otherPlayer: undefined,
        started: false,
    } as Room);
    dictionnaries: Promise<Dictionnary[]> = Promise.resolve([{ id: 0, name: 'français' }]);
    // constructor() {
    //     this.selectedRoom.next({
    //         id: 0,
    //         name: 'Room',
    //         parameters: new Parameters(),
    //         mainPlayer: { name: 'Player 1', id: '0', connected: true },
    //         otherPlayer: undefined,
    //         started: false,
    //     });
    // }

    // setRoom(): void {
    //     this.selectedRoom.next({
    //         id: 0,
    //         name: 'Room',
    //         parameters: new Parameters(),
    //         mainPlayer: { name: 'Player 1', id: '0', connected: true },
    //         otherPlayer: undefined,
    //         started: false,
    //     });

    // this.selectedRoom.subscribe(async () => {
    //  this.router.navigate(['/']);

    start() {
        return;
    }

    leave() {
        return;
    }

    kick() {
        return;
    }

    kickLeave() {
        return;
    }

    getId() {
        return;
    }
}

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let router: Router;
    let service: CommunicationServiceMock;

    beforeEach(async () => {
        service = new CommunicationServiceMock();
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), HttpClientModule, AppRoutingModule],
            declarations: [WaitingRoomPageComponent],
            providers: [{ provide: CommunicationService, useValue: service }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        router = TestBed.inject(Router);
        router.initialNavigation();
        service.selectedRoom.subscribe(async (room) => {
            if (room === undefined) router.navigate(['/']);
            else if (room.started) router.navigate(['/game']);
            fixture.detectChanges();
        });
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('leave should call leave from CommunicationService', () => {
        const leaveSpy = spyOn(service, 'leave');
        component.leave();
        expect(leaveSpy).toHaveBeenCalled();
    });

    it('start should call start from CommunicationService', () => {
        const startSpy = spyOn(service, 'start');
        component.start();
        expect(startSpy).toHaveBeenCalled();
    });

    it('kick should call kick from CommunicationService', () => {
        const kickSpy = spyOn(service, 'kick');
        component.kick();
        expect(kickSpy).toHaveBeenCalled();
    });

    it('kickLeave should call kickLeave from CommunicationService', () => {
        const kickLeaveSpy = spyOn(service, 'kickLeave');
        component.kickLeave();
        expect(kickLeaveSpy).toHaveBeenCalled();
    });
});
