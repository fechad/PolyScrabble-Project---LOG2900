import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { CountdownComponent } from 'ngx-countdown';

@Component({
    selector: 'app-chrono-container',
    templateUrl: './chrono-container.component.html',
    styleUrls: ['./chrono-container.component.scss'],
})
export class ChronoContainerComponent implements AfterViewInit {
    @ViewChild('countdown', { static: false }) cd: CountdownComponent;
    previousTurn = '';
    constructor(public gameContextService: GameContextService, public communicationService: CommunicationService) {}

    ngAfterViewInit() {
        this.gameContextService.state.subscribe((state) => {
            if (state.turn !== this.previousTurn) {
                this.cd.restart();
                this.cd.begin();
                this.previousTurn = state.turn;
            }
        });
    }
}
