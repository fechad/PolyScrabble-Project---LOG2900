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
        this.gameContextService.isMyTurn.subscribe(() => {
            this.reset();
        });
        this.gameContextService.myRackCount.subscribe((newCount) => {
            if (newCount < NORMAL_RACK_LENGTH) this.myRackIsVisible = true;
        });
        this.gameContextService.myRackCount.subscribe((newCount) => {
            if (newCount < NORMAL_RACK_LENGTH) this.opponentRackIsVisible = true;
        });
    }

    reset() {
        this.cd.restart();
        this.cd.begin();
    }

    onTimerFinished(e: CountdownEvent) {
        if (e.action === 'done' && this.gameContextService.skipTurnEnabled && this.gameContextService.isMyTurn.value) {
            this.communicationService.switchTurn();
        }
    }
}
