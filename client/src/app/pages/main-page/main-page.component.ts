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
            route: '/classic',
            toolTip: 'Une partie de Scrabble avec les règles standards.',
            texte: 'Mode Classique',
            disabled: false,
        },
        {
            route: '/2990',
            toolTip: 'Ajoutez du piquant à votre partie avec des objectifs supplémentaires',
            texte: 'Mode LOG2990',
            disabled: true,
        },
        { route: '', toolTip: 'Voyez qui règne', texte: 'Meilleurs scores', disabled: false },
    ];
    constructor(public mode: ModeServiceService) {}
}
