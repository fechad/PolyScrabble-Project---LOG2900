import { Component, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DEFAULT_HEIGHT, GridService } from '@app/services/grid.service';
import { SkipTurnService } from '@app/services/skip-turn.service';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faFont } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
@Injectable()
export class GamePageComponent {
    faQuestionCircle = faQuestionCircle;
    faFont = faFont;
    resetSize = DEFAULT_HEIGHT + DEFAULT_HEIGHT;

    constructor(private router: Router, public gridService: GridService, private skipTurn: SkipTurnService) {}

    quitGame() {
        this.router.navigateByUrl('http://localhost:4200/#/home');
    }
    skipMyTurn() {
        this.skipTurn.skipTurn();
    }
    resetFont() {
        this.gridService.fontSize = '7px system-ui';
        this.gridService.gridContext.beginPath();
        this.gridService.gridContext.clearRect(0, 0, this.resetSize, this.resetSize);
        this.gridService.drawGrid();
    }
    reduceFont() {
        this.gridService.fontSize = '6px system-ui';
        this.gridService.gridContext.beginPath();
        this.gridService.gridContext.clearRect(0, 0, this.gridService.width, this.gridService.height);
        this.gridService.drawGrid();
    }
    increaseFont() {
        this.gridService.fontSize = '8px system-ui';
        this.gridService.gridContext.beginPath();
        this.gridService.gridContext.clearRect(0, 0, this.gridService.width, this.gridService.height);
        this.gridService.drawGrid();
    }
}
