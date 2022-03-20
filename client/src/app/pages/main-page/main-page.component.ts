import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Button } from '@app/classes/button';
import { HighScoresComponent } from '@app/components/high-scores/high-scores.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    buttonsMainPage: Button[] = [
        {
            route: '/classic',
            toolTip: 'Une partie de Scrabble avec les règles standards.',
            text: 'Mode Classique',
            disabled: false,
            promptsDialog: false,
        },
        {
            route: '/2990',
            toolTip: 'Ajoutez du piquant à votre partie avec des objectifs supplémentaires',
            text: 'Mode LOG2990',
            disabled: true,
            promptsDialog: false,
        },
        { route: undefined, toolTip: 'Voyez qui règne', text: 'Meilleurs scores', disabled: false, promptsDialog: true },
    ];
    constructor(private readonly matDialog: MatDialog) {}

    openPopUp() {
        this.matDialog.open(HighScoresComponent);
    }
}
