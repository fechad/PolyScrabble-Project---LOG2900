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

<<<<<<< HEAD
const data = {
    room: 1,
    name: 'test',
    dictionary: 'francais',
};

<<<<<<< HEAD
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
=======
// Mock implements the behavior of open() method
=======
>>>>>>> 593b6be... mock for communication service
const dialogMock = {
    close: () => {
        return;
    },
};
>>>>>>> 0a3dbe6... clean up html unknown

export class CommunicationServiceMock {}
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
<<<<<<< HEAD
                { provide: CommunicationService, useValue: service },
                { provide: MatDialog, useValue: dialogMock },
                { provide: MAT_DIALOG_DATA, useValue: data },
=======
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatDialog, useValue: dialogMock },
>>>>>>> 0a3dbe6... clean up html unknown
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['dictionnaries']);
        fixture = TestBed.createComponent(JoiningRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // component.communicationService = Object.assign(new Promise<Dictionnary>(resolve => resolve(dictionnaries));
    });

<<<<<<< HEAD
=======
    // TO-DO: should create fails
>>>>>>> 593b6be... mock for communication service
    it('should create', () => {
        expect(component).toBeTruthy();
    });

<<<<<<< HEAD
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
=======
    // it('openDialog should open dialog from component', () => {
    //     const testRoom = new Room();
    //     const openDialogSpy = spyOn(component.dialog, 'open');
    //     component.openDialog(testRoom);
    //     expect(openDialogSpy).toHaveBeenCalled();
    // });
>>>>>>> 593b6be... mock for communication service
});
