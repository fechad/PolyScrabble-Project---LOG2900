import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(communicationService: CommunicationService, router: Router) {
        const prevRoom = { exists: true, started: true };
        communicationService.selectedRoom.subscribe((room) => {
            if (room === undefined && prevRoom.exists) router.navigate(['/']);
            else if (!room?.started && prevRoom.started) router.navigate(['/waiting-room']);
            else if (room?.started && !prevRoom.started) router.navigate(['/game']);
            else if (room !== undefined && !prevRoom.exists) router.navigate(['/waiting-room']);

            prevRoom.exists = room !== undefined;
            prevRoom.started = room?.started || false;
        });
    }
}
