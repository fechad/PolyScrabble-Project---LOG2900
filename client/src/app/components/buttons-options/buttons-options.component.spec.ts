import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MenusStatesService } from '@app/services/menus-states.service';
import { ButtonsOptionsComponent } from './buttons-options.component';

describe('ButtonsOptionsComponent', () => {
    let component: ButtonsOptionsComponent;
    let fixture: ComponentFixture<ButtonsOptionsComponent>;
    let matDialog: MatDialog;
    let menusStates: MenusStatesService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ButtonsOptionsComponent],
            providers: [
                { provide: MenusStatesService, useValue: menusStates },
                { provide: MatDialog, useValue: matDialog },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonsOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    fit('should create', () => {
        expect(component).toBeTruthy();
    });
});
