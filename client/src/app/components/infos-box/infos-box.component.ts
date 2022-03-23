import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { State } from '@app/classes/room';
import * as cst from '@app/constants';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { CountdownComponent } from 'ngx-countdown';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
export class InfosBoxComponent implements AfterViewInit, OnDestroy {
    @ViewChild('countdown', { static: false }) cd: CountdownComponent;
    myRackIsVisible = false;
    opponentRackIsVisible = false;
    summary: string | undefined = undefined;
    previousTurn: string | undefined = '';
    subscription: Subscription;

    constructor(public gameContextService: GameContextService, public communicationService: CommunicationService) {
        this.gameContextService.state.subscribe((state) => {
            const [myIdx, otherIdx] =
                this.gameContextService.state.value.players[0].info.id === this.communicationService.getId().value ? [0, 1] : [1, 0];
            if (state.players[myIdx].rackCount < cst.NORMAL_RACK_LENGTH) this.myRackIsVisible = true;
            if (state.players[otherIdx].rackCount < cst.NORMAL_RACK_LENGTH) this.opponentRackIsVisible = true;
            if (state.state === State.Aborted) {
                this.summary = '👑 Votre adversaire a abandonné, vous avez gagné! 👑';
            } else if (state.state !== State.Ended) {
                this.summary = undefined;
            } else if (state.winner === undefined) {
                this.summary = `👑 Félicitations ${state.players[0].info.name} et ${state.players[1].info.name}! 👑`;
            } else {
                const winnerName = state.players.find((player) => player.info.id === state.winner)?.info.name;
                this.summary = `👑 Félicitations ${winnerName}! 👑`;
            }
        });
    }

    ngAfterViewInit() {
        this.subscription = this.gameContextService.state.subscribe((state) => {
            if (state.turn !== this.previousTurn && this.cd) {
                this.cd.restart();
                this.cd.begin();
                this.previousTurn = state.turn;
            }
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) this.subscription.unsubscribe();
    }
}
