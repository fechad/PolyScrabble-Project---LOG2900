import { Component } from '@angular/core';
import { State } from '@app/classes/room';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { TimerService } from '@app/services/timer.service';

const NORMAL_RACK_LENGTH = 7;

@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
export class InfosBoxComponent {
    myRackIsVisible = false;
    opponentRackIsVisible = false;
    summary: string | undefined = undefined;

    constructor(public gameContextService: GameContextService, public communicationService: CommunicationService, public timerService: TimerService) {
        this.gameContextService.state.subscribe((state) => {
            const [myIdx, otherIdx] =
                this.gameContextService.state.value.players[0].info.id === this.communicationService.getId().value ? [0, 1] : [1, 0];
            if (state.players[myIdx].rackCount < NORMAL_RACK_LENGTH) this.myRackIsVisible = true;
            if (state.players[otherIdx].rackCount < NORMAL_RACK_LENGTH) this.opponentRackIsVisible = true;
            if (state.state === State.Aborted) {
                this.summary = '👑 Votre adversaire a abandonné, vous avez gagné! 👑';
            } else if (state.state !== State.Ended) {
                this.summary = undefined;
            } else if (state.winner === undefined) {
                this.summary = `👑 Félicitation ${state.players[0].info.name} et ${state.players[1].info.name}! 👑`;
            } else {
                const winnerName = state.players.find((player) => player.info.id === state.winner)?.info.name;
                this.summary = `👑 Félicitation ${winnerName}! 👑`;
            }
        });
    }
}
