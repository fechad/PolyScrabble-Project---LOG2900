import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ThreeButtonOptionsComponent } from './three-button-options.component';

describe('ThreeButtonOptionsComponent', () => {
    let component: ThreeButtonOptionsComponent;
    let fixture: ComponentFixture<ThreeButtonOptionsComponent>;
    let matDialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ThreeButtonOptionsComponent],
            providers: [{ provide: MatDialog, useValue: matDialog }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ThreeButtonOptionsComponent);
        component = fixture.componentInstance;
        const name = ['a', 'b'];
        component.name = name;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
