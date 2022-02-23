import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { ModeServiceService } from '@app/services/mode-service.service';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';
const NORMAL_RACK_LENGTH = 7;
@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
export class InfosBoxComponent implements AfterViewInit {
    @ViewChild('countdown', { static: false }) cd: CountdownComponent;
    myRackIsVisible = false;
    opponentRackIsVisible = false;
    constructor(public gameContextService: GameContextService, public communicationService: CommunicationService, public mode: ModeServiceService) {}

    ngAfterViewInit(): void {
        let prevTurn = this.gameContextService.state.value.turn;
        this.gameContextService.state.subscribe(state => {
            if (state.turn !== prevTurn) {
                prevTurn = state.turn;
                this.reset();
            }
            const [myIdx, otherIdx] = (this.gameContextService.state.value.players[0].info.id === this.communicationService.getId().value) ? [0, 1] : [1, 0];
            if (state.players[myIdx].rackCount < NORMAL_RACK_LENGTH) this.myRackIsVisible = true;
            if (state.players[otherIdx].rackCount < NORMAL_RACK_LENGTH) this.opponentRackIsVisible = true;
        });
    }

    reset() {
        this.cd.restart();
        this.cd.begin();
    }

    onTimerFinished(e: CountdownEvent) {
        if (e.action === 'done' && this.gameContextService.skipTurnEnabled && this.gameContextService.state.value.turn === this.communicationService.getId().value) {
            this.communicationService.switchTurn(true);
        }
    }
}
