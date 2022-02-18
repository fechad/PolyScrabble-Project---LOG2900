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
    isMainPlayer: boolean;
    otherPlayerName: string | undefined;

    constructor(public communicationService: CommunicationService, private router: Router) {
        this.communicationService.selectedRoom.subscribe(async (room) => {
            this.isMainPlayer = this.communicationService.getId()?.value === room?.mainPlayer.id;
            this.otherPlayerName = room?.otherPlayer?.name;

            const hasOtherPlayer = room?.otherPlayer !== undefined;
            this.canControl = hasOtherPlayer && this.isMainPlayer;
        });
    }

    leave() {
        this.communicationService.leave();
        this.router.navigate(['/joining-room']);
    }

    start() {
        this.communicationService.start();
    }

    kick() {
        this.communicationService.kick();
    }

    kickLeave() {
        this.communicationService.kickLeave();
        this.router.navigate(['/classic']);
    }
}
