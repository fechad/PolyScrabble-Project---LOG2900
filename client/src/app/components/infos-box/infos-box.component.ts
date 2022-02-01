<<<<<<< HEAD
import { Component, Injectable, Injector, OnInit } from '@angular/core';
import { SkipTurnService } from '@app/services/skip-turn.service';
=======
import { AfterViewInit, Component } from '@angular/core';
import { ChronoService } from '@app/services/chrono.service';
import { SkipTurn } from '@app/services/skipTurn.service';
>>>>>>> f7a4b98... ajout d'un timer qui change le tour apres 60 secondes
@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
<<<<<<< HEAD
@Injectable()
export class InfosBoxComponent implements OnInit {
    constructor(public skipTurn: SkipTurnService) {}
=======
export class InfosBoxComponent implements AfterViewInit {
    constructor(
        public skipTurn: SkipTurn, 
        public chronoService:ChronoService
        ) {}
>>>>>>> f7a4b98... ajout d'un timer qui change le tour apres 60 secondes

    ngAfterViewInit(): void {
        this.chronoService.startTimer();


    }
}
Injector.create({
    providers: [
        { provide: InfosBoxComponent, deps: [SkipTurnService] },
        { provide: SkipTurnService, deps: [] },
    ],
});
