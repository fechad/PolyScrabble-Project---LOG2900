import { AfterViewInit, Component, Injectable, Injector, ViewChild } from '@angular/core';
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
    timeData = 60;
    constructor(public skipTurn: SkipTurnService) {}

    ngAfterViewInit(): void {
        this.cd.begin();
    }
    startTimer() {
        // this.countDown.begin();
    }
    handleEvent(e: CountdownEvent) {
        if (e.action === 'done') {
            this.reset();
        }
    }
    reset() {
        this.cd.restart();
        this.cd.begin();
        this.skipTurn.skipTurn();
    }
}
Injector.create({
    providers: [{ provide: InfosBoxComponent, deps: [SkipTurnService] }],
});
