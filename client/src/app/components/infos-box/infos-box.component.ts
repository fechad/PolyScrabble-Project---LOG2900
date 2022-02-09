import { AfterViewInit, Component, Injectable, Injector, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { SkipTurnService } from '@app/services/skip-turn.service';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';

@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
@Injectable()
export class InfosBoxComponent implements AfterViewInit {
    // @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
    @ViewChild('countdown') cd: CountdownComponent;
    private subscription: any;
    constructor(public skipTurn: SkipTurnService, public gameContextService: GameContextService, public communicationService: CommunicationService) {
        this.subscription = gameContextService.isMyTurn.subscribe(() => {
            this.reset();
        });
    }

    ngAfterViewInit(): void {
        this.cd.begin();
    }

    handleEvent(e: CountdownEvent) {
        this.communicationService.switchTurn();
        if (e.action === 'done') {
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
Injector.create({
    providers: [{ provide: InfosBoxComponent, deps: [SkipTurnService] }],
});
