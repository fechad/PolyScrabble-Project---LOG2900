import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameHistory } from '@app/game-history';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-game-history-tab',
    templateUrl: './game-history-tab.component.html',
    styleUrls: ['./game-history-tab.component.scss'],
})
export class GameHistoryTabComponent implements OnInit {
    faTrash = faTrashAlt;
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
        const response = await this.httpClient.delete(`${environment.serverUrl}/high-scores`, { responseType: 'text' }).toPromise();
        this.snackbar.open(response, 'OK', { duration: 2000, panelClass: ['snackbar'] });
    }

    async confirmReset() {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr?',
            text: 'Vous vous apprêtez à effacer toutes les parties',
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
