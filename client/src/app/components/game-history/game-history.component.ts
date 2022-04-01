import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { GameHistory } from '@app/game-history';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent implements OnInit {
    games: GameHistory[];
    constructor(readonly httpClient: HttpClient) {}

    async ngOnInit(): Promise<void> {
        this.games = await this.httpClient.get<GameHistory[]>(`${environment.serverUrl}/game-history`).toPromise();
    }
}
