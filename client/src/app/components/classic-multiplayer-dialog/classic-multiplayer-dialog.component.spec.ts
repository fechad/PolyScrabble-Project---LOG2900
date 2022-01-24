import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassicMultiplayerDialogComponent } from './classic-multiplayer-dialog.component';

describe('ClassicMultiplayerDialogComponent', () => {
    let component: ClassicMultiplayerDialogComponent;
    let fixture: ComponentFixture<ClassicMultiplayerDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ClassicMultiplayerDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassicMultiplayerDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
