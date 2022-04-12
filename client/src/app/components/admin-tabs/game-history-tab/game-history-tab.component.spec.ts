import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameHistoryTabComponent } from './game-history-tab.component';

describe('GameHistoryTabComponent', () => {
    let component: GameHistoryTabComponent;
    let fixture: ComponentFixture<GameHistoryTabComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [GameHistoryTabComponent],
            providers: [MatSnackBar, Overlay],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameHistoryTabComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should clear history', () => {
        component.clearHistory();
        expect(component.games).toEqual([]);
    });
});
