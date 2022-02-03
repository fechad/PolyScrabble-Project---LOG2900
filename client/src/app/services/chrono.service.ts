import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { SkipTurnService } from './skip-turn.service';

@Injectable({
    providedIn: 'root',
})
export class ChronoService {
    constructor(public skipTurn: SkipTurnService) {}
    time: BehaviorSubject<number> = new BehaviorSubject(0);
    subscription: Subscription;
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
    }
}
Injector.create({
    providers: [
        { provide: ChronoService, deps: [SkipTurnService] },
        // { provide: SkipTurnService, deps: [] },
    ],
});
