import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '@app/classes/room';
import * as cst from '@app/constants';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService, Objective } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faAngleLeft, faAngleRight, faArrowRight, faFont, faPlay, faSignOutAlt, faWalking } from '@fortawesome/free-solid-svg-icons';
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
    faPlay = faPlay;
    faWalking = faWalking;
    faArrowRight = faArrowRight;
    faAngleLeft = faAngleLeft;
    faAngleRight = faAngleRight;

    resetSize = cst.DEFAULT_HEIGHT + cst.DEFAULT_HEIGHT;
    placingWords = true;
    publicObjectivesShown: boolean = true;
    privateObjectivesShown: boolean = true;
    readonly sent: Subject<void> = new Subject<void>();
    publicObjectives: Objective[];
    privateObjectives: Objective[];

    constructor(
        public gridService: GridService,
        public communicationService: CommunicationService,
        public gameContextService: GameContextService,
        public router: Router,
        private detectChanges: ChangeDetectorRef,
    ) {
        let ended = false;
        this.gameContextService.state.subscribe(async (state) => {
            if (ended) return;
            if (state.state === State.Ended || (state.state === State.Aborted && state.winner === this.gameContextService.myId)) {
                await this.communicationService.saveScore();
            }
            ended = state.state !== State.Started;
        });
        this.gameContextService.objectives.subscribe((objectives) => {
            this.publicObjectives = objectives ? objectives.filter((objective) => objective.isPublic) : [];
            this.privateObjectives = objectives ? objectives.filter((objective) => !objective.isPublic) : [];
        });
        console.log(this.publicObjectives);
    }

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
        } else {
            this.communicationService.leave();
        }
    }
    skipMyTurn() {
        this.gameContextService.switchTurn(false);
    }

    changeSize(multiplier: number) {
        this.gridService.multiplier = multiplier;
        this.gridService.gridContext.beginPath();
        this.gridService.gridContext.clearRect(0, 0, this.resetSize, this.resetSize);
        this.gridService.drawGrid();
    }

    showObjective(isPublic: boolean) {
        if (isPublic) this.publicObjectivesShown = !this.publicObjectivesShown;
        else this.privateObjectivesShown = !this.privateObjectivesShown;
    }
}
