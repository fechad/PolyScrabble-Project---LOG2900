import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { EndgamePopUpComponent } from './endgame-pop-up.component';

describe('EndgamePopUpComponent', () => {
    let component: EndgamePopUpComponent;
    let fixture: ComponentFixture<EndgamePopUpComponent>;
    let matDialogRef: MatDialogRef<EndgamePopUpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EndgamePopUpComponent],
            providers: [{ provide: MatDialogRef, useValue: matDialogRef }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EndgamePopUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
