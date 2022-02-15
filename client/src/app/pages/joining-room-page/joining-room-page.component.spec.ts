import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication.service';
import { JoiningRoomPageComponent } from './joining-room-page.component';

import SpyObj = jasmine.SpyObj;

const dialogMock = {
    close: () => {
        return;
    },
};

export class CommunicationServiceMock {}
describe('JoiningRoomPageComponent', () => {
    let component: JoiningRoomPageComponent;
    let fixture: ComponentFixture<JoiningRoomPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoiningRoomPageComponent],
            imports: [MatCardModule],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatDialog, useValue: dialogMock },
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

    // TO-DO: should create fails
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('openDialog should open dialog from component', () => {
    //     const testRoom = new Room();
    //     const openDialogSpy = spyOn(component.dialog, 'open');
    //     component.openDialog(testRoom);
    //     expect(openDialogSpy).toHaveBeenCalled();
    // });
});
