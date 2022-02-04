import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SkipTurnService {
    isYourTurn = true;
    constructor() {}

    skipTurn() {
        this.isYourTurn = !this.isYourTurn;
        /* TODO: Avertit le serveur que le joeur viens de passer son tour*/
    }
}
