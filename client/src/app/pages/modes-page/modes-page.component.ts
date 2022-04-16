import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Button } from '@app/classes/button';
import { GameSetupDialogComponent } from '@app/components/game-setup-dialog/game-setup-dialog.component';
import { SoloDialogComponent } from '@app/components/solo-dialog/solo-dialog.component';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-modes-page',
    templateUrl: './modes-page.component.html',
    styleUrls: ['./modes-page.component.scss'],
})
export class ModesPageComponent {
    log2990: boolean;
    buttons: Button[];

    constructor(public matDialog: MatDialog, route: ActivatedRoute, private communicationService: CommunicationService) {
        this.communicationService.isServerDown();
        this.log2990 = route.snapshot.url[0].toString() === '2990';
        this.buttons = [
            { promptsDialog: true, route: '', toolTip: '', text: 'Solo', disabled: false },
            { promptsDialog: true, route: '', toolTip: '', text: 'Multijoueur', disabled: false },
            { promptsDialog: false, route: '/joining-room', toolTip: '', text: 'Rejoindre une partie', disabled: false },
            { promptsDialog: false, route: '/home', toolTip: 'Retour au menu principal', text: 'Retour', disabled: false },
        ];
    }

    openDialog() {
        this.matDialog.open(GameSetupDialogComponent, { data: { log2990: this.log2990 } });
    }

    openSoloDialog() {
        this.matDialog.open(SoloDialogComponent, { data: { log2990: this.log2990 } });
    }
}
