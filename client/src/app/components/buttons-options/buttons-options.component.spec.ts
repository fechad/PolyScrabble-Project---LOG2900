import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ButtonsOptionsComponent } from './buttons-options.component';

describe('ButtonsOptionsComponent', () => {
    let component: ButtonsOptionsComponent;
    let fixture: ComponentFixture<ButtonsOptionsComponent>;
    let matDialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ButtonsOptionsComponent],
            providers: [{ provide: MatDialog, useValue: matDialog }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonsOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
