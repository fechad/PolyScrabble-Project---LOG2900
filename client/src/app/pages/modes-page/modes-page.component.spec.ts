import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ModesPageComponent } from './modes-page.component';

// Mock implements the behavior of open() method
export class MatDialogMock {
    open() {
        return { afterClosed: () => of({}) };
    }
}

export class ActivatedRouteMock {
    snapshot = { url: ['classique'] };
}

describe('ModesPageComponent', () => {
    let component: ModesPageComponent;
    let fixture: ComponentFixture<ModesPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModesPageComponent],
            providers: [
                { provide: MatDialog, useValue: MatDialogMock },
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

    fit('click on solo mode should open dialog', fakeAsync(() => {
        const openDialogSpy = spyOn(component, 'openDialog').and.callThrough();
        fixture.debugElement.query(By.css('.Solo')).nativeElement.click();
        tick();
        expect(openDialogSpy).toHaveBeenCalled();
    }));

    it('click on multiplayer mode should open dialog', fakeAsync(() => {
        const openDialogSpy = spyOn(component, 'openDialog').and.callThrough();
        fixture.debugElement.query(By.css('.Multijoueur')).nativeElement.click();
        tick();
        expect(openDialogSpy).toHaveBeenCalled();
    }));
});
