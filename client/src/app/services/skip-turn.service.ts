import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SkipTurnService {
    isYourTurn = true;
    turnChange: Subject<boolean> = new Subject<boolean>();
    constructor() {}

    skipTurn() {
        this.isYourTurn = !this.isYourTurn;
        this.turnChange.next(this.isYourTurn);

        /* TODO: Avertit le serveur que le joeur viens de passer son tour*/
    }
}
