// import { Injectable } from '@angular/core';
// import { PlayerId, State } from '@app/classes/room';
// import { BehaviorSubject, concat, from, interval, Subscription } from 'rxjs';
// import { map, take } from 'rxjs/operators';
// import { CommunicationService } from './communication.service';
// import { GameContextService } from './game-context.service';

// export const ONE_SECOND = 1000;
// const SECONDS_IN_MINUTE = 60;

// @Injectable({
//     providedIn: 'root',
// })
// export class TimerService {
//     readonly timer: BehaviorSubject<string> = new BehaviorSubject('?:??');
//     private prevSubscription: Subscription | undefined = undefined;

<<<<<<< HEAD
    constructor(private communicationService: CommunicationService, private gameContextService: GameContextService) {
        this.communicationService.selectedRoom.subscribe((room) => {
            if (!room || room.state !== State.Started) return;
            if (this.prevSubscription) this.prevSubscription.unsubscribe();
            let prevTurn: PlayerId | undefined;
            this.gameContextService.state.subscribe((state) => {
                if (state.turn === prevTurn) return;
                prevTurn = state.turn;
                if (this.prevSubscription) this.prevSubscription.unsubscribe();
                this.prevSubscription = concat(
                    from([room.parameters.timer]),
                    interval(ONE_SECOND).pipe(
                        take(room.parameters.timer),
                        map((t) => room.parameters.timer - t - 1),
                    ),
                )
                    .pipe(map((t) => this.convert(t)))
                    .subscribe(this.timer);
            });
        });
    }
=======
//     constructor(private communicationService: CommunicationService, private gameContextService: GameContextService) {
//         this.communicationService.selectedRoom.subscribe((room) => {
//             if (!room || room.state !== State.Started) return;
//             if (this.prevSubscription) this.prevSubscription.unsubscribe();
//             let prevTurn: PlayerId;
//             this.gameContextService.state.subscribe((state) => {
//                 if (state.turn === prevTurn) return;
//                 prevTurn = state.turn;
//                 if (this.prevSubscription) this.prevSubscription.unsubscribe();
//                 this.prevSubscription = concat(
//                     from([room.parameters.timer]),
//                     interval(ONE_SECOND).pipe(
//                         take(room.parameters.timer),
//                         map((t) => room.parameters.timer - t - 1),
//                     ),
//                 )
//                     .pipe(map((t) => this.convert(t)))
//                     .subscribe(this.timer);
//             });
//         });
//     }
>>>>>>> a36934e... fixed timer for good

//     private convert(t: number): string {
//         const minutes = Math.floor(t / SECONDS_IN_MINUTE);
//         const secs = t % SECONDS_IN_MINUTE;
//         return `${minutes}:${String(secs).padStart(2, '0')}`;
//     }
// }
