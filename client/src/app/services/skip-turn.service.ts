import { Injectable } from '@angular/core';
import { ChronoService } from './chrono.service';

@Injectable({
    providedIn: 'root',
})
export class SkipTurnService {
    isYourTurn = true;
    chrono: ChronoService;
    constructor() {}

    skipTurn() {
        this.isYourTurn = !this.isYourTurn;
        // this.chrono.startTimer();
    }
}
