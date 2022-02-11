import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelpInfoComponent } from './help-info.component';

describe('HelpInfoComponent', () => {
    let component: HelpInfoComponent;
    let fixture: ComponentFixture<HelpInfoComponent>;
    let matDialogRef: MatDialogRef<HelpInfoComponent>;
    let matDialogData: typeof MAT_DIALOG_DATA;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HelpInfoComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: matDialogData },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HelpInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
