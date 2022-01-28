import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SkipTurn } from '@app/services/skipTurn.service';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faCogs } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    faQuestionCircle = faQuestionCircle;
    faCogs = faCogs;
    constructor(private router: Router, private skipTurn: SkipTurn) {}

    quitGame() {
        this.router.navigateByUrl('http://localhost:4200/#/home');
    }
    skipMyTurn() {
        this.skipTurn.skipTurn();
    }
}
