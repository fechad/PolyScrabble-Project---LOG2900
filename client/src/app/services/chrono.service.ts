import { Injectable } from '@angular/core';
import { SkipTurn } from '@app/services/skipTurn.service';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChronoService {
    constructor(public skipTurn: SkipTurn) {}
    time: BehaviorSubject<number> = new BehaviorSubject(0);
    startTimer() {
        const obs$ = interval(1000);
        obs$.subscribe((d) => {
            if (d != 59) {
                this.time.next(59 - d);
            } else {
                this.time.next(0);
                this.skipTurn.skipTurn();
                this.startTimer();
            }
        });
    }
}
