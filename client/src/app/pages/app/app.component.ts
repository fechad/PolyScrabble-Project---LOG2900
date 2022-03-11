import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '@app/classes/room';
import { CommunicationService } from '@app/services/communication.service';
import { map, skip } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(communicationService: CommunicationService, router: Router) {
        let prevState: State | undefined;
        communicationService.selectedRoom
            .pipe(
                skip(1),
                map((room) => room?.state),
            )
            .subscribe((state) => {
                if (prevState === state) return;

                if (state === State.Setup) router.navigate(['/waiting-room']);
                else if (state === State.Started) router.navigate(['/game']);
                else if (state === undefined || prevState === undefined) router.navigate(['/']);

                prevState = state;
            });
        router.navigate(['/']);
    }
}
