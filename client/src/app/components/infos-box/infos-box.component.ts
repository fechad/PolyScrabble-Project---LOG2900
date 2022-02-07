import { AfterViewInit, Component, Injectable, Injector, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
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
    constructor(public gameContextService: GameContextService, public communicationService: CommunicationService) {
        this.subscription = gameContextService.isMainPlayerTurn.subscribe(() => {
            this.reset();
        });
    }

    ngAfterViewInit(): void {
        this.cd.begin();
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
Injector.create({
    providers: [{ provide: InfosBoxComponent, deps: [GameContextService] }],
});
