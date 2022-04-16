import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { GameHistory } from '@app/game-history';
import { faSync, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-game-history-tab',
    templateUrl: './game-history-tab.component.html',
    styleUrls: ['./game-history-tab.component.scss'],
})
export class GameHistoryTabComponent implements OnInit {
    faTrash = faTrashAlt;
    faRefresh = faSync;
    games: GameHistory[] = [];
    constructor(readonly httpClient: HttpClient) {}

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

    async confirmReset() {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr?',
            text: 'Vous vous apprêtez à réinitialiser toutes les parties',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non',
            heightAuto: false,
        });

        if (!result.value) return;
        if (result.isConfirmed) {
            this.clearHistory();
        } else {
            Swal.close();
        }
    }
}
