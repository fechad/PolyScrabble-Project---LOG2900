import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { By } from '@angular/platform-browser';
import { HelpInfoComponent } from './help-info.component';

const dialogMock = {
    close: () => {},
};

describe('HelpInfoComponent', () => {
    let component: HelpInfoComponent;
    let fixture: ComponentFixture<HelpInfoComponent>;
    // let matDialogRef: MatDialogRef<HelpInfoComponent>;
    let matDialogData: typeof MAT_DIALOG_DATA;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HelpInfoComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: MAT_DIALOG_DATA, useValue: matDialogData },
            ],
            imports: [MatCardModule, MatToolbarModule, MatIconModule],
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

    it('click on cancel should close dialog', fakeAsync(() => {
        spyOn(component, 'closeDialog');
        fixture.debugElement.query(By.css('.icone-cancel')).nativeElement.click();
        tick();
        expect(component.closeDialog).toHaveBeenCalled();
    }));

    it('click on cancel should close component dialog', () => {
        const closeSpy = spyOn(component.dialogRef, 'close');
        component.closeDialog();
        expect(closeSpy).toHaveBeenCalled();
    });
});
