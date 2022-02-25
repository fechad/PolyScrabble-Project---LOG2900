import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { GameSetupDialogComponent } from '@app/components/game-setup-dialog/game-setup-dialog.component';
import { ModeServiceService } from '@app/services/mode-service.service';

@Component({
    selector: 'app-modes-page',
    templateUrl: './modes-page.component.html',
    styleUrls: ['./modes-page.component.scss'],
})
export class ModesPageComponent {
    boutons = [
        { promptsDialog: true, route: '', toolTip: '', texte: 'Solo' },
        { promptsDialog: true, route: '', toolTip: '', texte: 'Multijoueur' },
        { promptsDialog: false, route: '/joining-room', toolTip: '', texte: 'Rejoindre une partie' },
        { promptsDialog: false, route: '/home', toolTip: 'Retour au menu principal', texte: 'Retour' },
    ];
    constructor(public matDialog: MatDialog, public route: ActivatedRoute, public mode: ModeServiceService) {}

    openDialog() {
        this.matDialog.open(GameSetupDialogComponent, { data: { mode: this.route.snapshot.url[0] } });
    }
}
