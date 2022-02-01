import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SkipTurnService {
    isYourTurn = true;
    constructor() {}

    skipTurn() {
        this.isYourTurn = !this.isYourTurn;
    }
}
