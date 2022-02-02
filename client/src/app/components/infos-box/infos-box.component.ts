<<<<<<< HEAD
import { AfterViewInit, Component, Injectable, Injector } from '@angular/core';
import { ChronoService } from '@app/services/chrono.service';
import { SkipTurnService } from '@app/services/skip-turn.service';

=======
import { AfterViewInit, Component } from '@angular/core';
import { ChronoService } from '@app/services/chrono.service';
import { SkipTurn } from '@app/services/skipTurn.service';
>>>>>>> 381553880f1e48587b8eac11a5c81c2bf6a8b0e6
@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
<<<<<<< HEAD
@Injectable()
export class InfosBoxComponent implements AfterViewInit {
    constructor(public skipTurn: SkipTurnService, public chronoService: ChronoService) {}

    ngAfterViewInit(): void {
        this.chronoService.startTimer();
=======
export class InfosBoxComponent implements AfterViewInit {
    constructor(
        public skipTurn: SkipTurn, 
        public chronoService:ChronoService
        ) {}

    ngAfterViewInit(): void {
        this.chronoService.startTimer();


>>>>>>> 381553880f1e48587b8eac11a5c81c2bf6a8b0e6
    }
}
Injector.create({
    providers: [
        { provide: InfosBoxComponent, deps: [SkipTurnService, ChronoService] },
        { provide: SkipTurnService, deps: [] },
        { provide: ChronoService, deps: [] },
    ],
});
