import { Injectable } from '@angular/core';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!

@Injectable({
    providedIn: 'root',
})
export class SkipTurn {
    tourPlayer1 = true;
    tourPlayer2 = false;
    skipTurn() {
        if (this.tourPlayer1) {
            this.tourPlayer1 = false;
            this.tourPlayer2 = true;
        } else {
            this.tourPlayer1 = true;
            this.tourPlayer2 = false;
        }
    }
}
