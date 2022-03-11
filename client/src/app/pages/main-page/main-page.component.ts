import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HighScoresComponent } from '@app/components/high-scores/high-scores.component';

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
            openPopUp: false,
        },
        {
            route: '/2990',
            toolTip: 'Ajoutez du piquant à votre partie avec des objectifs supplémentaires',
            texte: 'Mode LOG2990',
            disabled: true,
            openPopUp: false,
        },
        { route: undefined, toolTip: 'Voyez qui règne', texte: 'Meilleurs scores', disabled: false, openPopUp: true },
    ];
    constructor(private readonly matDialog: MatDialog) {}

    openPopUp() {
        this.matDialog.open(HighScoresComponent);
    }
}
