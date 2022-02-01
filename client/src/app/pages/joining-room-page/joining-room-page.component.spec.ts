import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { JoiningRoomPageComponent } from './joining-room-page.component';

describe('JoiningRoomPageComponent', () => {
    let component: JoiningRoomPageComponent;
    let fixture: ComponentFixture<JoiningRoomPageComponent>;
    let matDialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoiningRoomPageComponent],
            providers: [{ provide: MatDialog, useValue: matDialog }],
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
});
