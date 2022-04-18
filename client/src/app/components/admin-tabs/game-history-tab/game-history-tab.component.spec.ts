import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameHistoryTabComponent } from './game-history-tab.component';

describe('GameHistoryTabComponent', () => {
    let component: GameHistoryTabComponent;
    let fixture: ComponentFixture<GameHistoryTabComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [GameHistoryTabComponent],
            providers: [MatSnackBar, Overlay],
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

    // it('should delete all games from list on confirmation', fakeAsync(() => {
    //     component.confirmReset(false);
    //     Swal.clickConfirm();
    //     tick();
    //     expect(component.games).toEqual([]);

    //     const req = httpMock.match(`${environment.serverUrl}/game-history`);
    //     console.log(req[2]);
    //     expect(req[1].request.method).toBe('DELETE');
    //     req[0].flush('succes');
    //     req[1].flush('score');

    //     httpMock.verify();
    // }));
});
