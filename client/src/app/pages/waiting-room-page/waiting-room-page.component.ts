import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent {
    constructor(public communicationService: CommunicationService, private router: Router) {
        if (communicationService.selectedRoom.value === undefined) {
            this.router.navigate(['/home']);
        }
        this.communicationService.events.once('start', async () => this.router.navigate(['/game']));
    }

    leave() {
        this.communicationService.leave();
    }

    start() {
        this.communicationService.start();
    }

    kick() {
        this.communicationService.kick();
    }
}
