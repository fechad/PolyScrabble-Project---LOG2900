import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameSetupDialogComponent } from '@app/components/game-setup-dialog/game-setup-dialog.component';

@Component({
    selector: 'app-classic-modes-page',
    templateUrl: './classic-modes-page.component.html',
    styleUrls: ['../../styles/menus.scss'],
})
export class ClassicModesPageComponent {
    mainPage: boolean;
    constructor(public dialog: MatDialog) {}
    openDialog() {
        this.dialog.open(GameSetupDialogComponent);
    }
}
