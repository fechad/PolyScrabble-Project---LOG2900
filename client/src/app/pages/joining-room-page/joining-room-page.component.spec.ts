import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import { CommunicationService } from '@app/services/communication.service';
import { BehaviorSubject } from 'rxjs';
import { JoiningRoomPageComponent } from './joining-room-page.component';

const dialogMock = {
    open: () => {
        return;
    },
};

const data = {
    room: 1,
    name: 'test',
    dictionary: 'francais',
};

export class CommunicationServiceMock {
    selectedRoom: BehaviorSubject<Room> = new BehaviorSubject({
        id: 0,
        name: 'Room',
        parameters: new Parameters(),
        mainPlayer: { name: 'Player 1', id: '0', connected: true },
        otherPlayer: undefined,
        started: false,
    } as Room);
    dictionnaries = Promise.resolve([{ id: 0, name: 'francais' }]);
}

describe('JoiningRoomPageComponent', () => {
    let component: JoiningRoomPageComponent;
    let fixture: ComponentFixture<JoiningRoomPageComponent>;
    let service: CommunicationServiceMock;

    beforeEach(async () => {
        service = new CommunicationServiceMock();
        await TestBed.configureTestingModule({
            declarations: [JoiningRoomPageComponent],
            imports: [MatCardModule],
            providers: [
                { provide: CommunicationService, useValue: service },
                { provide: MatDialog, useValue: dialogMock },
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoiningRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openDialog should open dialog from component', () => {
        const testRoom: Room = {
            id: 0,
            name: 'Room',
            parameters: new Parameters(),
            mainPlayer: { name: 'Player 1', id: '0', connected: true },
            otherPlayer: undefined,
            started: false,
        };
        const openDialogSpy = spyOn(component.dialog, 'open');
        component.openDialog(testRoom);
        expect(openDialogSpy).toHaveBeenCalled();
    });
});
