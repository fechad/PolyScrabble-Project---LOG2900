import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { BehaviorSubject, Observable } from 'rxjs';
import { Letter } from './Alphabet';

type Tile = Letter | undefined;
type Board = Tile[][];

@Injectable({
    providedIn: 'root',
})
export class GameContextService {
    readonly letterRack: BehaviorSubject<Letter[]> = new BehaviorSubject([] as Letter[]);
    readonly board: BehaviorSubject<Board> = new BehaviorSubject([] as Board);
    readonly messages: BehaviorSubject<Message[]> = new BehaviorSubject([] as Message[]);
    readonly tempMessages: BehaviorSubject<string[]> = new BehaviorSubject([] as string[]);
    readonly isMainPlayerTurn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    letterRackCast: Observable<Letter[]>;
    private msgCount: number = 0;
    constructor() {
        this.letterRackCast = this.letterRack.asObservable();
    }
    iStart() {
        this.isMainPlayerTurn.next(true);
    }

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

    setPlayerTurn(isMainPlayerTurn: boolean) {
        this.isMainPlayerTurn.next(isMainPlayerTurn);
    }
}
