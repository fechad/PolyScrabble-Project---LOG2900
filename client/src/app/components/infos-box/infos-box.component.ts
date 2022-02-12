import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { CountdownComponent } from 'ngx-countdown';

@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
export class InfosBoxComponent implements AfterViewInit {
    @ViewChild('countdown') cd: CountdownComponent;

    constructor(public gameContextService: GameContextService, public communicationService: CommunicationService) {}

    ngAfterViewInit(): void {
        this.reset();
        this.gameContextService.isMyTurn.asObservable().subscribe(() => {
            this.reset();
        });
    }

    reset() {
        this.cd.restart();
        this.cd.begin();
    }
}
