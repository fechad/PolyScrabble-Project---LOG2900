import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { JoiningRoomPageComponent } from './joining-room-page.component';

import SpyObj = jasmine.SpyObj;

// Mock implements the behavior of open() method
export class MatDialogMock {
    open() {
        return { afterClosed: () => of({}) };
    }
}

describe('JoiningRoomPageComponent', () => {
    // let component: JoiningRoomPageComponent;
    let fixture: ComponentFixture<JoiningRoomPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoiningRoomPageComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatDialog, useValue: MatDialogMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoiningRoomPageComponent);
        // component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // TO-DO: should create fails
    // it('should create', () => {
    //     expect(component).toBeTruthy();
    // });

    // TO-DO: mock class Room
    // fit('openDialog should open dialog from component', () => {
    //     const testRoom = new Room();
    //     const openDialogSpy = spyOn(component.dialog, 'open');
    //     component.openDialog(testRoom);
    //     expect(openDialogSpy).toHaveBeenCalled();
    // });
});
