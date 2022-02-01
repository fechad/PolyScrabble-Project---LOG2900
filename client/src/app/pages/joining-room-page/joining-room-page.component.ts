import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JoinSetupDialogComponent } from '@app/components/join-setup-dialog/join-setup-dialog.component';
import { GamesListService } from '@app/services/games-list.service';
import { MenusStatesService } from '@app/services/menus-states.service';

@Component({
    selector: 'app-joining-room-page',
    templateUrl: './joining-room-page.component.html',
    styleUrls: ['./joining-room-page.component.scss'],
})
export class JoiningRoomPageComponent implements OnInit {
    constructor(public dialog: MatDialog, public state: MenusStatesService, private gameService?: GamesListService) {}

    ngOnInit(): void {}

    get gameList() {
        return this.gameService?.getAllGames();
    }

    openDialog() {
        this.dialog.open(JoinSetupDialogComponent);
    }
}
