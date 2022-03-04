import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';
import { ModesPageComponent } from './modes-page.component';

export class ActivatedRouteMock {
    snapshot = { url: ['classic'] };
}

const dialogMock = {
    close: () => {
        return;
    },
};

describe('ModesPageComponent', () => {
    let component: ModesPageComponent;
    let fixture: ComponentFixture<ModesPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModesPageComponent],
            imports: [AppMaterialModule],
            providers: [
                { provide: MatDialog, useValue: dialogMock },
                { provide: ActivatedRoute, useValue: new ActivatedRouteMock() },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(ModesPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('click on multiplayer mode should open dialog', fakeAsync(() => {
        const openDialogSpy = spyOn(component, 'openDialog').and.callThrough();
        fixture.debugElement.query(By.css('.Multijoueur')).nativeElement.click();
        tick();
        expect(openDialogSpy).toHaveBeenCalled();
    }));

    it('click on solo mode should open solo dialog', fakeAsync(() => {
        const openDialogSpy = spyOn(component, 'openSoloDialog').and.callThrough();
        fixture.debugElement.query(By.css('.Solo')).nativeElement.click();
        tick();
        expect(openDialogSpy).toHaveBeenCalled();
    }));
});
