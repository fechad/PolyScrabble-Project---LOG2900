import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { GamePageComponent } from './game-page.component';

// import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, SidebarComponent, PlayAreaComponent],
            imports: [RouterTestingModule.withRoutes(routes), HttpClientTestingModule],
            providers: [{ provide: GameContextService }, { provide: CommunicationService }],
        }).compileComponents();
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call quitGame() when quit-game button clicked ', async () => {
        const quitGameSpy = spyOn(component, 'quitGame').and.callThrough();
        const button = fixture.debugElement.nativeElement.querySelector('#quit-game');
        button.click();
        fixture.whenStable().then(() => {
            expect(quitGameSpy).toHaveBeenCalled();
        });
    });
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
