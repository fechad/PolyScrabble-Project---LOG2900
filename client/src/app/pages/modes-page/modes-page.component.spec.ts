import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
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
});
