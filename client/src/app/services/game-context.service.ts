import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { BehaviorSubject, Subject } from 'rxjs';
import { Letter } from './Alphabet';

const BOARD_LENGTH = 15;

export type Tile = Letter | undefined;
type Board = Tile[][];

@Injectable({
    providedIn: 'root',
})
export class GameContextService {
    letter: Tile;
    // BehaviorSubject<> = new BehaviorSubject();
    readonly rack: BehaviorSubject<Letter[]> = new BehaviorSubject([] as Letter[]);
    letterRack: Subject<Letter[]> = new Subject();
    readonly board: BehaviorSubject<Board> = new BehaviorSubject([] as Board);
    readonly messages: BehaviorSubject<Message[]> = new BehaviorSubject([] as Message[]);
    readonly tempMessages: BehaviorSubject<string[]> = new BehaviorSubject([] as string[]);
    readonly isMainPlayerTurn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    private msgCount: number = 0;

    constructor() {
        for (let i = 0; i < BOARD_LENGTH; i++) {
            const row = [];
            for (let j = 0; j < BOARD_LENGTH; j++) {
                row.push(undefined);
            }
            this.board.next([...this.board.value, row]);
        }
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
    updateRack(newRack: Letter[]) {
        this.letterRack.next(newRack);
    }

    getRackObs() {
        return this.letterRack.asObservable();
    }
}
