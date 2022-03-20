import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '@app/classes/room';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { DEFAULT_HEIGHT, GridService } from '@app/services/grid.service';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faAngleDoubleRight, faFont, faPlay, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements AfterViewChecked {
    faQuestionCircle = faQuestionCircle;
    faFont = faFont;
    faSignOutAlt = faSignOutAlt;
    faAngleDoubleRight = faAngleDoubleRight;
    faPlay = faPlay;
    resetSize = DEFAULT_HEIGHT + DEFAULT_HEIGHT;
    placingWords = true;
    readonly sent: Subject<void> = new Subject<void>();
    constructor(
        public gridService: GridService,
        public communicationService: CommunicationService,
        public gameContextService: GameContextService,
        public router: Router,
        private detectChanges: ChangeDetectorRef,
    ) {}

    ngAfterViewChecked(): void {
        this.placingWords = this.gridService.letterForServer.length === 0;
        this.detectChanges.detectChanges();
    }

    send() {
        this.sent.next();
    }

    async quitGame() {
        const text =
            this.gameContextService.state.value.state !== State.Started
                ? ['Êtes vous sûr?', 'Vous vous apprêtez à quitter la partie', 'Quitter', 'Rester']
                : ['Êtes vous sûr?', 'Vous vous apprêtez à déclarer forfait', 'Abandonner', 'Continuer à jouer'];
        const result = await Swal.fire({
            title: text[0],
            text: text[1],
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: text[2],
            cancelButtonText: text[3],
        });

        if (!result.value) return;
        if (this.gameContextService.state.value.state === State.Started) {
            this.communicationService.confirmForfeit();
        } else if (
            this.gameContextService.state.value.state === State.Aborted &&
            this.gameContextService.state.value.winner !== this.gameContextService.myId
        ) {
            this.communicationService.leave();
        } else {
            await this.communicationService.saveScore();
            this.communicationService.leave();
        }
    }
    skipMyTurn() {
        this.communicationService.switchTurn(false);
    }

    changeSize(multiplier: number) {
        this.gridService.multiplier = multiplier;
        this.gridService.gridContext.beginPath();
        this.gridService.gridContext.clearRect(0, 0, this.resetSize, this.resetSize);
        this.gridService.drawGrid();
    }
}
