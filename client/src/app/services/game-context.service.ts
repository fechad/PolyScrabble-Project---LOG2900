import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { BehaviorSubject, Subject } from 'rxjs';
import { Letter } from './Alphabet';

type Tile = Letter | undefined;
type Board = Tile[][];

@Injectable({
    providedIn: 'root',
})
export class GameContextService {
    letterRack: Subject<Letter[]> = new Subject();
    readonly board: BehaviorSubject<Board> = new BehaviorSubject([] as Board);
    readonly messages: BehaviorSubject<Message[]> = new BehaviorSubject([] as Message[]);
    readonly tempMessages: BehaviorSubject<string[]> = new BehaviorSubject([] as string[]);
    readonly isMyTurn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    readonly myName: string;
    readonly opponentName: string;
    private msgCount: number = 0;

    receiveMessages(message: Message, msgCount: number, myself: boolean) {
        this.messages.next([...this.messages.value, message]);
        if (this.msgCount < msgCount && myself) {
            this.tempMessages.value.splice(0, msgCount - this.msgCount);
            this.msgCount = msgCount;
        }
    }

    addMessage(message: string, local: boolean) {
        if (local) {
            this.messages.next([...this.messages.value, { text: message, emitter: 'local' }]);
        } else {
            this.tempMessages.next([...this.tempMessages.value, message]);
        }
    }

    setMyTurn(isYourTurn: boolean) {
        this.isMyTurn.next(isYourTurn);
    }

    updateRack(newRack: Letter[]) {
        this.letterRack.next(newRack);
    }

    getRackObs() {
        return this.letterRack.asObservable();
    }
}
