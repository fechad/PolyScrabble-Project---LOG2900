import { Component } from '@angular/core';
const boutonMainPage = [
    { route: '', toolTip: 'Une partie de Scrabble avec les règles standards.', texte: 'Classique' },
    { route: '', toolTip: 'Ajoutez du piquant à votre partie avec des objectifs supplémentaires', texte: 'Mode 2990' },
    { route: '', toolTip: 'Voyez qui règne', texte: 'Meilleurs scores' },
];
const boutonModeChoisi = [
    { route: '/waiting-room', toolTip: '', texte: 'Solo' },
    { route: '/waiting-room', toolTip: '', texte: 'Muiltijoueur' },
    { route: '/waiting-room', toolTip: '', texte: 'Rejoindre une partie' },
];
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['../../styles/menus.scss'],
})
export class MainPageComponent {
    isMain: boolean = true;
    donneesBoutons = boutonMainPage;
    mode: string;
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
