import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
    games: GameHistory[];
    constructor(readonly httpClient: HttpClient) {}

    async ngOnInit(): Promise<void> {
        this.games = (await this.httpClient.get<GameHistory[]>(`${environment.serverUrl}/game-history`).toPromise()).reverse();
    }

    async clearHistory() {
        await this.httpClient.delete(`${environment.serverUrl}/game-history`).toPromise();
        await this.ngOnInit();
    }
}
