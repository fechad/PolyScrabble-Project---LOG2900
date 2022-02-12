import { Component } from '@angular/core';
import { ModeServiceService } from '@app/services/mode-service.service';

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
            texte: 'Mode Classique',
        },
        {
            route: '/2990',
            toolTip: 'Ajoutez du piquant à votre partie avec des objectifs supplémentaires',
            texte: 'Mode 2990',
        },
        { route: '', toolTip: 'Voyez qui règne', texte: 'Meilleurs scores' },
    ];
    constructor(public mode: ModeServiceService) {}
}
