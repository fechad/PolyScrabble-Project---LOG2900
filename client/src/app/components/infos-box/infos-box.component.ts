import { AfterViewInit, Component, Injectable, Injector, ViewChild } from '@angular/core';
import { SkipTurnService } from '@app/services/skip-turn.service';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';
import { Subscription } from 'rxjs';

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
    turnChange: boolean;
    private _subscription: Subscription;
    constructor(public skipTurn: SkipTurnService) {
        this.turnChange = skipTurn.isYourTurn;
        this._subscription = skipTurn.turnChange.subscribe((value) => {
            this.reset();
        });
    }

    ngAfterViewInit(): void {
        this.cd.begin();
    }

    handleEvent(e: CountdownEvent) {
        if (e.action === 'done') {
            this.reset();
        }
    }
    reset() {
        this.cd.restart();
        this.cd.begin();
    }
    ngOnDestroy() {
        this._subscription.unsubscribe();
    }
}
Injector.create({
    providers: [{ provide: InfosBoxComponent, deps: [SkipTurnService] }],
});
