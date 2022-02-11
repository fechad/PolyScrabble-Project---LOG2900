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

    constructor(public gameContextService: GameContextService, public communicationService: CommunicationService) {
        this.subscription = gameContextService.isMyTurn.subscribe(() => {
            this.reset();
        });
    }

    ngAfterViewInit(): void {
        this.cd.begin();
    }

    getMainPlayer(): string | undefined {
        return this.communicationService.selectedRoom.value?.mainPlayer.name;
    }

    getOtherPlayer(): string | undefined {
        return this.communicationService.selectedRoom.value?.otherPlayer?.name;
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
