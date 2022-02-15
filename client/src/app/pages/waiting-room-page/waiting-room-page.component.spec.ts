import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { BehaviorSubject } from 'rxjs';
import { WaitingRoomPageComponent } from './waiting-room-page.component';

class CommunicationServiceMock {
    // dictionary: Dictionnary = {
    //     id: 0,
    //     name: 'français',
    // };
    selectedRoom: BehaviorSubject<Room>;
    // dictionnaries: Promise<Dictionnary[]> = Promise.resolve({ id: 0, name: 'français' });
    setRoom(): void {
        this.selectedRoom.next({
            id: 0,
            name: 'Room name',
            parameters: new Parameters(),
            mainPlayer: { name: 'Player 1', id: '0', connected: true },
            otherPlayer: undefined,
            started: false,
        });
    }
}

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let router: Router;
    // let communicationServiceSpy: SpyObj<CommunicationService>;
    const service = new CommunicationServiceMock();

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), HttpClientModule, AppRoutingModule],
            declarations: [WaitingRoomPageComponent],
            providers: [
                { provide: CommunicationService, useClass: CommunicationServiceMock },
                { provide: Router, useValue: router },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        // communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['start'], ['leave']);
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        router = TestBed.inject(Router);
        router.initialNavigation();
        component = fixture.componentInstance;
        component.communicationService.selectedRoom.subscribe(async (room) => {
            if (room === undefined) router.navigate(['/']);
            else if (room.started) router.navigate(['/game']);
            fixture.detectChanges();
        });

        it('should create', () => {
            expect(component).toBeTruthy();
            service.setRoom();
        });

        // it('leave should call leave from CommunicationService', async () => {
        //     component.leave();
        //     expect(communicationServiceSpy.leave).toHaveBeenCalled();
        // });

        // it('start should call start from CommunicationService', () => {
        //     component.start();
        //     expect(communicationServiceSpy.start).toHaveBeenCalled();
        // });

        // it('kick should call kick from CommunicationService', () => {
        //     component.kick();
        //     expect(communicationServiceSpy.kick).toHaveBeenCalled();
        // });
    });
});
