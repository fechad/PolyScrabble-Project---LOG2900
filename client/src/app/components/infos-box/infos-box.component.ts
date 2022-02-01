import { AfterViewInit, Component } from '@angular/core';
import { ChronoService } from '@app/services/chrono.service';
import { SkipTurn } from '@app/services/skipTurn.service';
@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
export class InfosBoxComponent implements AfterViewInit {
    constructor(
        public skipTurn: SkipTurn, 
        public chronoService:ChronoService
        ) {}

    ngAfterViewInit(): void {
        this.chronoService.startTimer();


    }
}
