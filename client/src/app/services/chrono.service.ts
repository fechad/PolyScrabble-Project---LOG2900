<<<<<<< HEAD
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { SkipTurnService } from './skip-turn.service';
=======
import { Injectable } from '@angular/core';
import { SkipTurn } from '@app/services/skipTurn.service';
import { BehaviorSubject, interval } from 'rxjs';
>>>>>>> 381553880f1e48587b8eac11a5c81c2bf6a8b0e6

@Injectable({
    providedIn: 'root',
})
export class ChronoService {
<<<<<<< HEAD
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
        { provide: SkipTurnService, deps: [] },
    ],
});
=======
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
>>>>>>> 381553880f1e48587b8eac11a5c81c2bf6a8b0e6
