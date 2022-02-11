import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
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
    let httpClient: HttpClient;
    let gameService: GameContextService;
    let communicationService: CommunicationService;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, SidebarComponent, PlayAreaComponent],
            imports: [RouterTestingModule.withRoutes(routes)],
            providers: [
                { provide: HttpClient, useValue: httpClient },
                { provide: GameContextService, useValue: gameService },
                { provide: CommunicationService, useValue: communicationService },
                { provide: Router, useValue: router },
            ],
        }).compileComponents();
        router = TestBed.inject(Router);
        gameService = TestBed.inject(GameContextService);
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
