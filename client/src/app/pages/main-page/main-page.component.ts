import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameSetupDialogComponent } from '@app/components/game-setup-dialog/game-setup-dialog.component';
const boutonMainPage = [
    { route: '', toolTip: 'Une partie de Scrabble avec les règles standards.', texte: 'Classique' },
    { route: '', toolTip: 'Ajoutez du piquant à votre partie avec des objectifs supplémentaires', texte: 'Mode 2990' },
    { route: '', toolTip: 'Voyez qui règne', texte: 'Meilleurs scores' },
];
const boutonModeChoisi = [
    { route: '', toolTip: '', texte: 'Solo' },
    { route: '', toolTip: '', texte: 'Multijoueur' },
    { route: '/joining-room', toolTip: '', texte: 'Rejoindre une partie' },
];
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['../../styles/menus.scss'],
})
export class MainPageComponent {
    sendTimeToServer() {
        throw new Error('Method not implemented.');
    }
    getMessagesFromServer() {
        throw new Error('Method not implemented.');
    }
    isMain: boolean = true;
    donneesBoutons = boutonMainPage;
    mode: string;
    constructor(public dialog: MatDialog) {}
    openDialog(isMain: boolean, text: string) {
        if (!isMain && text !== 'Rejoindre une partie') {
            this.dialog.open(GameSetupDialogComponent);
        }
    }
    changeState(button?: string) {
        switch (button) {
            case 'Meilleurs scores': {
                this.isMain = true;
                break;
            }
            case undefined: {
                this.isMain = true;
                this.donneesBoutons = boutonMainPage;
                break;
            }
            default: {
                this.isMain = false;
                this.mode = button === undefined ? 'welp' : button;
                this.donneesBoutons = boutonModeChoisi;
                break;
            }
        }
    }
}
