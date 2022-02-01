import { Injectable } from '@angular/core';
//import { ChronoService } from '@app/services/chrono.service';
// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!

@Injectable({
    providedIn: 'root',
})
export class SkipTurn {
    /*constructor(
        public chronoService:ChronoService
        ) {}*/
    isYourTurn = true;
    skipTurn() {
        this.isYourTurn = !this.isYourTurn;
        //this.chronoService.time.next(0);
        //this.chronoService.startTimer();
    }
}
