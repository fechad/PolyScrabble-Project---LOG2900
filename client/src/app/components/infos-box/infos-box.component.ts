<<<<<<< HEAD
import { Component } from '@angular/core';
import { State } from '@app/classes/room';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { CountdownComponent } from 'ngx-countdown';
=======
import { AfterViewInit, Component, ViewChild } from '@angular/core';
>>>>>>> a36934e... fixed timer for good

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
    summary: string | undefined = undefined;
    previousTurn = '';

    constructor(private gameContextService: GameContextService, public communicationService: CommunicationService) {
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

    ngAfterViewInit() {
        this.gameContextService.state.subscribe((state) => {
            if (state.turn !== this.previousTurn) {
                this.cd.restart();
                this.cd.begin();
                this.previousTurn = state.turn;
            }
        });
    }
}
