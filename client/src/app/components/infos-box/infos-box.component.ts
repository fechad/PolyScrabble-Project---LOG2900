import { Component } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { TimerService } from '@app/services/timer.service';

const NORMAL_RACK_LENGTH = 7;
const SECONDS_IN_MINUTE = 60;

@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
export class InfosBoxComponent {
    myRackIsVisible = false;
    opponentRackIsVisible = false;
    timer: string = '?:??';

    constructor(public gameContextService: GameContextService, public communicationService: CommunicationService, timerService: TimerService) {
        this.gameContextService.state.subscribe((state) => {
            const [myIdx, otherIdx] =
                this.gameContextService.state.value.players[0].info.id === this.communicationService.getId().value ? [0, 1] : [1, 0];
            if (state.players[myIdx].rackCount < NORMAL_RACK_LENGTH) this.myRackIsVisible = true;
            if (state.players[otherIdx].rackCount < NORMAL_RACK_LENGTH) this.opponentRackIsVisible = true;
        });
        timerService.timer.subscribe((t) => {
            const minutes = Math.floor(t / SECONDS_IN_MINUTE);
            const secs = t % SECONDS_IN_MINUTE;
            this.timer = `${minutes}:${String(secs).padStart(2, '0')}`;
        });
    }
}
