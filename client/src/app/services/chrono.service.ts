import { Injectable, Injector } from '@angular/core';
import { CountdownComponent } from 'ngx-countdown';
// import { BehaviorSubject, Subscription } from 'rxjs';
import { SkipTurnService } from './skip-turn.service';

@Injectable({
    providedIn: 'root',
})
export class ChronoService {
    timer: CountdownComponent;
    constructor(public skipTurn: SkipTurnService) {}
    // time: BehaviorSubject<number> = new BehaviorSubject(0);
    // subscription: Subscription;
    // this.countDown.config = { format: 'mm:ss', leftTime: 60, demand: false };

    /*
    startTimer() {
        const time = this.time;
        const obs$ = interval(1000);
        this.subscription = obs$.subscribe((d) => {
            time.next(10 - d);
        });
        setTimeout(() => {
            this.reset();
        }, 11000);
    }
    reset() {
        this.subscription.unsubscribe();
        this.startTimer();
        this.skipTurn.skipTurn();
    }*/
}
Injector.create({
    providers: [
        { provide: ChronoService, deps: [SkipTurnService, CountdownComponent] },
        // { provide: SkipTurnService, deps: [] },
    ],
});
