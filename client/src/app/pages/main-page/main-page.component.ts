import { Component } from '@angular/core';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    boutonMainPage = [
        {
            route: '/classique',
            toolTip: 'Une partie de Scrabble avec les règles standards.',
            texte: 'Mode classique',
        },
        {
            route: '/2990',
            toolTip: 'Ajoutez du piquant à votre partie avec des objectifs supplémentaires',
            texte: 'Mode 2990',
        },
        { route: '', toolTip: 'Voyez qui règne', texte: 'Meilleurs scores' },
    ];

}
