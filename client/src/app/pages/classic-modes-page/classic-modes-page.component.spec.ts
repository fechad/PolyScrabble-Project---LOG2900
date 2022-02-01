import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ClassicModesPageComponent } from './classic-modes-page.component';

describe('ClassicModesPageComponent', () => {
    let component: ClassicModesPageComponent;
    let fixture: ComponentFixture<ClassicModesPageComponent>;
    let matDialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ClassicModesPageComponent],
            providers: [{ provide: MatDialog, useValue: matDialog }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassicModesPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
