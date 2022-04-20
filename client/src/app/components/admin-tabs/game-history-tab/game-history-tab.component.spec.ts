import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameHistory, GameMode, PlayerGameInfo } from '@app/game-history';
import { from } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { GameHistoryTabComponent } from './game-history-tab.component';

class MatSnackBarMock {
    open() {
        return true;
    }
}

describe('GameHistoryTabComponent', () => {
    let component: GameHistoryTabComponent;
    let fixture: ComponentFixture<GameHistoryTabComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [GameHistoryTabComponent],
            providers: [{ provide: MatSnackBar, useClass: MatSnackBarMock }, Overlay],
        }).compileComponents();
        httpMock = TestBed.inject(HttpTestingController);
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

    it('should clear high-scores', fakeAsync(() => {
        const gameList: GameHistory[] = [
            {
                startTime: new Date('0-01-2022'),
                length: '30 min',
                firstPlayer: { name: 'dummy', pointsScored: 2, replacedBy: 'Etienne' } as PlayerGameInfo,
                secondPlayer: { name: 'dummer', pointsScored: 20, replacedBy: null } as PlayerGameInfo,
                mode: GameMode.Classic,
            },
        ];
        // get private attribute
        // eslint-disable-next-line dot-notation
        const spy = spyOn(component['snackbar'], 'open').and.callThrough();
        const subscription = component.clearHighScores();
        tick();
        from(subscription).subscribe(() => {
            expect(spy).toHaveBeenCalled();
        });
        tick();
        const reqDelete = httpMock.expectOne(`${environment.serverUrl}/high-scores`);
        const reqGet = httpMock.expectOne(`${environment.serverUrl}/game-history`);
        expect(reqDelete.request.method).toBe('DELETE');
        reqDelete.flush('succes');
        reqGet.flush(gameList);
        httpMock.verify();
    }));

    it('should delete all game histories when confirmed', fakeAsync(() => {
        const spy = spyOn(component, 'clearHistory').and.callThrough();

        component.confirmReset(false);
        Swal.clickConfirm();
        tick();
        flush();
        expect(spy).toHaveBeenCalled();
    }));
    it('should delete all high-scores when confirmed', fakeAsync(() => {
        const spy = spyOn(component, 'clearHighScores').and.callThrough();

        component.confirmReset(true);
        Swal.clickConfirm();
        tick();
        flush();
        expect(spy).toHaveBeenCalled();
    }));
});
