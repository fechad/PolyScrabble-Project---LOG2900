import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { SkipTurnService } from './skip-turn.service';

@Injectable({
    providedIn: 'root',
})
export class ChronoService {
    constructor(public skipTurn: SkipTurnService) {}
    time: BehaviorSubject<number> = new BehaviorSubject(0);

    startTimer() {
        const time = this.time;
        const obs$ = interval(1000);
        obs$.subscribe((d) => {
            if (d != 59) {
                time.next(59 - d);
            } else {
                time.next(0);
                time.unsubscribe();
            }
        });
    }
    reset() {
        this.time.unsubscribe();
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
