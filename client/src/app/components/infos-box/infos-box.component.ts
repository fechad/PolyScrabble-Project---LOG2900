import { AfterViewInit, Component, Injectable, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
@Injectable()
export class InfosBoxComponent implements AfterViewInit {
    @ViewChild('countdown') cd: CountdownComponent;
    private subscription: Subscription;
    timeData = 60;
    turnChange: boolean;
    private mainPlayer: string | undefined;
    private otherPlayer: string | undefined;

    constructor(public gameContextService: GameContextService, public communicationService: CommunicationService) {
        this.subscription = gameContextService.isMainPlayerTurn.subscribe((value) => {
            this.turnChange = value;
            this.reset();
        });

        this.mainPlayer = this.communicationService.selectedRoom.value?.mainPlayer.name;
        this.otherPlayer = this.communicationService.selectedRoom.value?.otherPlayer?.name;
    }

    ngAfterViewInit(): void {
        this.cd.begin();
    }

    getMainPlayer(): string | undefined {
        return this.mainPlayer;
    }

    getOtherPlayer(): string | undefined {
        return this.otherPlayer;
    }

    handleEvent(e: CountdownEvent) {
        if (e.action === 'done') {
            this.communicationService.resetTimer();
            this.reset();
        }
    }
    reset() {
        this.cd.restart();
        this.cd.begin();
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
