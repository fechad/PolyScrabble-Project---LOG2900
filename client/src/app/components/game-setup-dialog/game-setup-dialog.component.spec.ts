import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSetupDialogComponent } from './game-setup-dialog.component';

describe('GameSetupDialogComponent', () => {
    let component: GameSetupDialogComponent;
    let fixture: ComponentFixture<GameSetupDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameSetupDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSetupDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
