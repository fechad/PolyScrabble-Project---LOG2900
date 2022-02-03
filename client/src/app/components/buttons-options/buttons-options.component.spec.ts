import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MenusStatesService } from '@app/services/menus-states.service';
import { of } from 'rxjs';
import { ButtonsOptionsComponent } from './buttons-options.component';

import SpyObj = jasmine.SpyObj;

// Mock implements the behavior of open() method
export class MatDialogMock {
    open() {
        return { afterClosed: () => of({}) };
    }
}

describe('ButtonsOptionsComponent', () => {
    let menusStatesServiceSpy: SpyObj<MenusStatesService>;
    let component: ButtonsOptionsComponent;
    let fixture: ComponentFixture<ButtonsOptionsComponent>;

    beforeEach(() => {
        menusStatesServiceSpy = jasmine.createSpyObj('MenusStatesService', ['assignMode']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ButtonsOptionsComponent],
            providers: [
                { provide: MenusStatesService, useValue: menusStatesServiceSpy },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
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

    it('should open dialog when prompt is true', () => {
        const prompt = true;
        const openDialogSpy = spyOn(component.matDialog, 'open');
        component.openDialog(prompt);
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('should not open dialog when prompt is false', () => {
        const prompt = false;
        const openDialogSpy = spyOn(component.matDialog, 'open');
        component.openDialog(prompt);
        expect(openDialogSpy).toHaveBeenCalledTimes(0);
    });

    it('modifyMode should assign mode with service', () => {
        const chosenMode = 'classique';
        component.modifyMode(chosenMode);
        expect(menusStatesServiceSpy.assignMode).toHaveBeenCalled();
    });
});
