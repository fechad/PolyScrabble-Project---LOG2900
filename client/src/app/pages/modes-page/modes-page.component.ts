import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Button } from '@app/classes/button';
import { GameSetupDialogComponent } from '@app/components/game-setup-dialog/game-setup-dialog.component';
import { SoloDialogComponent } from '@app/components/solo-dialog/solo-dialog.component';

@Component({
    selector: 'app-modes-page',
    templateUrl: './modes-page.component.html',
    styleUrls: ['./modes-page.component.scss'],
})
export class ModesPageComponent {
    mode: string;
    buttons: Button[] = [
        { promptsDialog: true, route: '', toolTip: '', text: 'Solo', disabled: false },
        { promptsDialog: true, route: '', toolTip: '', text: 'Multijoueur', disabled: false },
        { promptsDialog: false, route: '/joining-room', toolTip: '', text: 'Rejoindre une partie', disabled: false },
        { promptsDialog: false, route: '/home', toolTip: 'Retour au menu principal', text: 'Retour', disabled: false },
    ];
    constructor(public matDialog: MatDialog, public route: ActivatedRoute) {
        this.mode = this.route.snapshot.url[0].toString();
    }

    openDialog() {
        this.matDialog.open(GameSetupDialogComponent, { data: { mode: this.mode } });
    }

    openSoloDialog() {
        this.matDialog.open(SoloDialogComponent, { data: { mode: this.route.snapshot.url[0] } });
    }
}
