import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';
import { LetterRackComponent } from '@app/components/letter-rack/letter-rack.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import Swal from 'sweetalert2';
import { GamePageComponent } from './game-page.component';

const dialogMock = {
    close: () => {
        return;
    },
};

export class CommunicationServiceMock {
    isWinner = false;
    getId(): number {
        return 1;
    }
    confirmForfeit() {
        return;
    }
    leave() {
        return;
    }
    switchTurn(timerRequest: boolean) {
        return timerRequest;
    }
}

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameContextService: GameContextService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, SidebarComponent, PlayAreaComponent, ChatBoxComponent, LetterRackComponent],
            imports: [
                RouterTestingModule.withRoutes(routes),
                HttpClientTestingModule,
                FontAwesomeModule,
                MatCardModule,
                MatToolbarModule,
                MatIconModule,
                FormsModule,
            ],
            providers: [
                { provide: MatDialog, useValue: dialogMock },
                { provide: GridService, usevalue: {} },
                { provide: CommunicationService, useClass: CommunicationServiceMock },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(GamePageComponent);
        gameContextService = TestBed.inject(GameContextService);
        const router = TestBed.inject(Router);
        router.initialNavigation();
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call openConfirmation() when quit-game button clicked ', fakeAsync(() => {
        const forfeitGameSpy = spyOn(component, 'quitGame').and.callThrough();
        const button = fixture.debugElement.query(By.css('#quit-game'));
        button.nativeElement.click();
        tick();
        expect(forfeitGameSpy).toHaveBeenCalled();
        flush();
    }));

    it('should call fire a swal alert when quit-game button clicked ', () => {
        const swalSpy = spyOn(Swal, 'fire').and.callThrough();
        component.quitGame();
        expect(swalSpy).toHaveBeenCalled();
    });

    it('should forfeit if confirm is clicked in swal', (done) => {
        const swalConfirmSpy = spyOn(component.communicationService, 'confirmForfeit');
        component.quitGame();
        Swal.clickConfirm();
        setTimeout(() => {
            expect(swalConfirmSpy).toHaveBeenCalled();
            done();
        });
    });

    it('should quit if confirm is clicked in swal', (done) => {
        gameContextService.state.next({ ...gameContextService.state.value, ended: true });
        const swalConfirmSpy = spyOn(component.communicationService, 'leave');
        component.quitGame();
        Swal.clickConfirm();
        setTimeout(() => {
            expect(swalConfirmSpy).toHaveBeenCalled();
            done();
        });
    });

    it('should switch turn if skipTurn() is called', () => {
        const turnSpy = spyOn(component.communicationService, 'switchTurn').and.callThrough();
        component.skipMyTurn();
        expect(turnSpy).toHaveBeenCalled();
    });

    it('click on reducing font size of board should call reduceFont()', fakeAsync(() => {
        const reduceFontSpy = spyOn(component, 'reduceFont').and.callThrough();
        const button = fixture.debugElement.query(By.css('#reduce'));
        button.nativeElement.click();
        tick();
        expect(reduceFontSpy).toHaveBeenCalled();
    }));

    it('click on reset font size of board should call resetFont()', fakeAsync(() => {
        const resetFontSpy = spyOn(component, 'resetFont').and.callThrough();
        const button = fixture.debugElement.query(By.css('#reset'));
        button.nativeElement.click();
        tick();
        expect(resetFontSpy).toHaveBeenCalled();
    }));

    it('click on increasing font size of board should call increaseFont()', fakeAsync(() => {
        const increaseFontSpy = spyOn(component, 'increaseFont').and.callThrough();
        const button = fixture.debugElement.query(By.css('#increase'));
        button.nativeElement.click();
        tick();
        expect(increaseFontSpy).toHaveBeenCalled();
    }));
});
