import { AfterViewInit, Component, Injectable, Injector } from '@angular/core';
import { ChronoService } from '@app/services/chrono.service';
import { SkipTurnService } from '@app/services/skip-turn.service';

@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
@Injectable()
export class InfosBoxComponent implements AfterViewInit {
    constructor(public skipTurn: SkipTurnService, public chronoService: ChronoService) {}

    ngAfterViewInit(): void {
        this.chronoService.startTimer();
    }
}
Injector.create({
    providers: [
        { provide: InfosBoxComponent, deps: [SkipTurnService, ChronoService] },
        { provide: SkipTurnService, deps: [] },
        { provide: ChronoService, deps: [] },
    ],
});
