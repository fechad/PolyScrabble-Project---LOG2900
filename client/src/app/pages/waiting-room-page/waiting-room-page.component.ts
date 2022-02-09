import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent {
    canControl: boolean;

    constructor(public communicationService: CommunicationService, private router: Router) {
        this.communicationService.selectedRoom.subscribe(async (room) => {
            if (room === undefined) await this.router.navigate(['/home']);
            else if (room.started) this.router.navigate(['/game']);

            const hasOtherPlayer = room?.otherPlayer !== undefined;
            const isMainPlayer = this.communicationService.getId() === room?.mainPlayer.id;
            this.canControl = hasOtherPlayer && isMainPlayer;
        });
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
