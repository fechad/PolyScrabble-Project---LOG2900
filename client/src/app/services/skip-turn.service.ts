import { Injectable } from '@angular/core';
<<<<<<< HEAD:client/src/app/services/skip-turn.service.ts
import { ChronoService } from './chrono.service';
=======
//import { ChronoService } from '@app/services/chrono.service';
// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!
>>>>>>> 381553880f1e48587b8eac11a5c81c2bf6a8b0e6:client/src/app/services/SkipTurn.service.ts

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
>>>>>>> 381553880f1e48587b8eac11a5c81c2bf6a8b0e6:client/src/app/services/SkipTurn.service.ts
    isYourTurn = true;
    chrono: ChronoService;
    constructor() {}

    skipTurn() {
        this.isYourTurn = !this.isYourTurn;
<<<<<<< HEAD:client/src/app/services/skip-turn.service.ts
        // this.chrono.startTimer();
=======
        //this.chronoService.time.next(0);
        //this.chronoService.startTimer();
>>>>>>> 381553880f1e48587b8eac11a5c81c2bf6a8b0e6:client/src/app/services/SkipTurn.service.ts
    }
}
