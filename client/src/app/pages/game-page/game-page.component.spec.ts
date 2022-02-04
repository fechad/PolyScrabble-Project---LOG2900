import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { GamePageComponent } from './game-page.component';

// import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    // let skipTurnService: SkipTurnService;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, SidebarComponent, PlayAreaComponent],
            providers: [{ provide: Router, useValue: router }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        // skipTurnService = TestBed.inject(SkipTurnService);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    /*
    it('skipMyTurn should call skipTurn', () => {
        const skipTurnSpy = spyOn(skipTurnService, 'skipTurn').and.callThrough();
        component.skipMyTurn();
        expect(skipTurnSpy).toHaveBeenCalled();
    });
   
    it('should call skipTurn() when skip-turn button clicked ', fakeAsync(() => {
        const skipTurnSpy = spyOn(skipTurnService, 'skipTurn').and.callThrough();
        const button = fixture.debugElement.query(By.css('#skip-turn'));
        button.nativeElement.click();
        tick();
        expect(skipTurnSpy).toHaveBeenCalled();
    }));
*/
    it('should call quitGame() when quit-game button clicked ', fakeAsync(() => {
        const quitGameSpy = spyOn(component, 'quitGame').and.callThrough();
        const button = fixture.debugElement.query(By.css('#quit-game'));
        button.nativeElement.click();
        tick();
        expect(quitGameSpy).toHaveBeenCalled();
    }));
});
