import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClassicMultiplayerDialogComponent } from '@app/components/game-dialog/classic-multiplayer-dialog.component';
import { GamesListService } from '@app/services/games-list.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit {
    constructor(public dialog: MatDialog, private gameService?: GamesListService) {}

    ngOnInit(): void {}

    get gameList() {
        return this.gameService?.getAllGames();
    }

    openDialog() {
        this.dialog.open(ClassicMultiplayerDialogComponent);
    }
}
