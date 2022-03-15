import { Component, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '@app/classes/room';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { DEFAULT_HEIGHT, GridService } from '@app/services/grid.service';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faAngleDoubleRight, faFont, faPlay, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

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
    faPlay = faPlay;
    resetSize = DEFAULT_HEIGHT + DEFAULT_HEIGHT;
    isSending = false;
    constructor(
        public gridService: GridService,
        public communicationService: CommunicationService,
        public gameContextService: GameContextService,
        public router: Router,
    ) {}

    send() {
        this.isSending = true;
    }
    async quitGame() {
        let text = [''];
        if (this.gameContextService.state.value.ended) text = ['Êtes vous sûr?', 'Vous vous apprêtez à quitter la partie', 'Quitter', 'Rester'];
        else text = ['Êtes vous sûr?', 'Vous vous apprêtez à déclarer forfait', 'Abandonner', 'Continuer à jouer'];
        const result = await Swal.fire({
            title: text[0],
            text: text[1],
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: text[2],
            cancelButtonText: text[3],
        });
        if (!result.value) return;
        if (this.gameContextService.state.value.ended) {
            if (this.communicationService.selectedRoom.value?.state === State.Ended) await this.communicationService.saveScore();
            this.communicationService.leave();
        } else {
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
