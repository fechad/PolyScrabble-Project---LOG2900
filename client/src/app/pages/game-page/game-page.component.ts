import { Component, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HelpInfoComponent } from '@app/components/help-info/help-info.component';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { DEFAULT_HEIGHT, GridService } from '@app/services/grid.service';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faAngleDoubleRight, faFont, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
@Injectable()
export class GamePageComponent {
    faQuestionCircle = faQuestionCircle;
    faFont = faFont;
    faSignOutAlt = faSignOutAlt;
    faAngleDoubleRight = faAngleDoubleRight;
    resetSize = DEFAULT_HEIGHT + DEFAULT_HEIGHT;
    constructor(
        public gridService: GridService,
        public communicationService: CommunicationService,
        public dialog: MatDialog,
        public gameContextService: GameContextService,
    ) {}

    helpInfo() {
        this.dialog.open(HelpInfoComponent);
    }

    openConfirmation() {
        if (confirm('Voulez-vous abandonner la partie?')) {
            this.communicationService.confirmForfeit();
        }
    }

    skipMyTurn() {
        this.communicationService.switchTurn(false);
    }
    resetFont() {
        this.gridService.multiplier = 1;
        this.gridService.gridContext.beginPath();
        this.gridService.gridContext.clearRect(0, 0, this.resetSize, this.resetSize);
        this.gridService.drawGrid();
    }
    reduceFont() {
        this.gridService.multiplier = 0.9;
        this.gridService.gridContext.beginPath();
        this.gridService.gridContext.clearRect(0, 0, this.gridService.width, this.gridService.height);
        this.gridService.drawGrid();
    }
    increaseFont() {
        this.gridService.multiplier = 1.1;
        this.gridService.gridContext.beginPath();
        this.gridService.gridContext.clearRect(0, 0, this.gridService.width, this.gridService.height);
        this.gridService.drawGrid();
    }
}
