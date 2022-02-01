import { Injectable } from '@angular/core';
import { ButtonParameters } from '@app/classes/button-parameters';

@Injectable({
    providedIn: 'root',
})
export class MenusStatesService {
    isMain: boolean = true;
    boutonMainPage: ButtonParameters[] = [
        {
            promptsDialog: false,
            route: '/classique',
            toolTip: 'Une partie de Scrabble avec les règles standards.',
            texte: 'Mode classique',
            mode: 'classique',
        },
        {
            promptsDialog: false,
            route: '/2990',
            toolTip: 'Ajoutez du piquant à votre partie avec des objectifs supplémentaires',
            texte: 'Mode 2990',
            mode: '2990',
        },
        { promptsDialog: false, route: '', toolTip: 'Voyez qui règne', texte: 'Meilleurs scores', mode: '' },
    ];
    boutonModeChoisi: ButtonParameters[] = [
        { promptsDialog: true, route: '', toolTip: '', texte: 'Solo', mode: '' },
        { promptsDialog: true, route: '', toolTip: '', texte: 'Multijoueur', mode: '' },
        { promptsDialog: false, route: '/joining-room', toolTip: '', texte: 'Rejoindre une partie', mode: '' },
    ];
    mode: string;
    assignMode(chosenMode: string) {
        if (chosenMode !== '') {
            this.mode = chosenMode;
        }
    }
}
