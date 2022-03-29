import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameHistoryTabComponent } from './game-history-tab.component';

describe('GameHistoryTabComponent', () => {
    let component: GameHistoryTabComponent;
    let fixture: ComponentFixture<GameHistoryTabComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameHistoryTabComponent],
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
});
