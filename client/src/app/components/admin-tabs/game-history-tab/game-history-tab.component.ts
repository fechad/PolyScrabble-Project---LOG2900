import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameHistory } from '@app/game-history';
import { faSync, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-game-history-tab',
    templateUrl: './game-history-tab.component.html',
    styleUrls: ['./game-history-tab.component.scss'],
})
export class GameHistoryTabComponent implements OnInit {
    faTrash = faTrashAlt;
    faRefresh = faSync;
    games: GameHistory[] = [];
    constructor(readonly httpClient: HttpClient, private snackbar: MatSnackBar) {}

    async ngOnInit(): Promise<void> {
        this.games = (await this.httpClient.get<GameHistory[]>(`${environment.serverUrl}/game-history`).toPromise()).reverse();
        this.games.map((game) => {
            game.startTime = new Date(game.startTime); // this allows to use Date() Object functions on attribute startTime
        });
    }

    async clearHistory() {
        await this.httpClient.delete(`${environment.serverUrl}/game-history`).toPromise();
        this.games = [];
    }

    async clearHighScores() {
        const response = await this.httpClient.delete<string>(`${environment.serverUrl}/high-scores`).toPromise();
        this.snackbar.open(response, 'OK', { duration: 2000, panelClass: ['snackbar'] });
    }
}
