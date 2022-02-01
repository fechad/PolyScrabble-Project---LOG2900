import { Injectable } from '@angular/core';
<<<<<<< HEAD:client/src/app/services/skip-turn.service.ts
=======
//import { ChronoService } from '@app/services/chrono.service';
// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!
>>>>>>> f7a4b98... ajout d'un timer qui change le tour apres 60 secondes:client/src/app/services/SkipTurn.service.ts

@Injectable({
    providedIn: 'root',
})
<<<<<<< HEAD:client/src/app/services/skip-turn.service.ts
export class SkipTurnService {
=======
export class SkipTurn {
    /*constructor(
        public chronoService:ChronoService
        ) {}*/
>>>>>>> f7a4b98... ajout d'un timer qui change le tour apres 60 secondes:client/src/app/services/SkipTurn.service.ts
    isYourTurn = true;
    constructor() {}

    skipTurn() {
        this.isYourTurn = !this.isYourTurn;
        //this.chronoService.time.next(0);
        //this.chronoService.startTimer();
    }
}
