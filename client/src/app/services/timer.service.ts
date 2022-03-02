import { Injectable } from '@angular/core';
import { PlayerId } from '@app/classes/room';
import { interval, Subject, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { CommunicationService } from './communication.service';
import { GameContextService } from './game-context.service';

const ONE_SECOND = 1000;

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    readonly timer: Subject<number> = new Subject();
    private prevTurn: PlayerId;
    private prevSubscription: Subscription | undefined = undefined;

    constructor(private communicationService: CommunicationService, private gameContextService: GameContextService) {
        this.communicationService.selectedRoom.subscribe((room) => {
            if (!room || !room.started) return;
            this.gameContextService.state.subscribe((state) => {
                if (state.turn === this.prevTurn) return;
                this.prevTurn = state.turn;
                if (this.prevSubscription) this.prevSubscription.unsubscribe();
                this.timer.next(room.parameters.timer);
                this.prevSubscription = interval(ONE_SECOND)
                    .pipe(
                        take(room.parameters.timer),
                        map((t) => room.parameters.timer - t - 1),
                    )
                    .subscribe(this.timer);
            });
        });
    }
}
