import { Injectable } from '@angular/core';
import { Letter } from '@app/classes/letter';
import { Message } from '@app/classes/message';
import { BehaviorSubject } from 'rxjs';
const BOARD_LENGTH = 15;
const NORMAL_RACK_LENGTH = 7;
export type Tile = Letter | null;
export type Board = Tile[][];

@Injectable({
    providedIn: 'root',
})
export class GameContextService {
    letter: Tile;
    readonly rack: BehaviorSubject<Letter[]> = new BehaviorSubject([] as Letter[]);
    readonly board: BehaviorSubject<Board> = new BehaviorSubject([] as Board);
    readonly messages: BehaviorSubject<Message[]> = new BehaviorSubject([] as Message[]);
    readonly tempMessages: BehaviorSubject<string[]> = new BehaviorSubject([] as string[]);
    readonly isMyTurn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    readonly myScore: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    readonly opponentScore: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    readonly reserveCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    readonly myRackCount: BehaviorSubject<number> = new BehaviorSubject<number>(NORMAL_RACK_LENGTH);
    readonly opponentRackCount: BehaviorSubject<number> = new BehaviorSubject<number>(NORMAL_RACK_LENGTH);
    myName: string;
    opponentName: string;
    skipTurnEnabled: boolean = true;
    private msgCount: number = 0;

    constructor() {
        const grid = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            const row = [];
            for (let j = 0; j < BOARD_LENGTH; j++) {
                row.push(null);
            }
            grid.push(row);
        }
        this.board.next(grid);
    }

    setBoard(board: Board) {
        this.board.next(board);
    }

    allowSwitch(isAllowed: boolean) {
        this.skipTurnEnabled = isAllowed;
    }

    receiveMessages(message: Message, msgCount: number, myself: boolean) {
        this.messages.next([...this.messages.value, message]);
        if (this.msgCount <= msgCount && myself) {
            this.tempMessages.value.splice(0, msgCount - this.msgCount + 1);
        }
        this.msgCount = msgCount + 1;
    }

    clearMessages() {
        this.messages.next([]);
    }

    addMessage(message: string, local: boolean) {
        if (local) {
            this.messages.next([...this.messages.value, { text: message, emitter: 'local' }]);
        } else {
            this.tempMessages.next([...this.tempMessages.value, message]);
        }
    }

    setName(playerName: string, isMe: boolean) {
        if (isMe) {
            this.myName = playerName;
        } else {
            this.opponentName = playerName;
        }
    }

    setScore(score: number, isMe: boolean) {
        if (isMe) {
            this.myScore.next(score);
        } else {
            this.opponentScore.next(score);
        }
    }

    updateRack(newRack: Letter[], opponentCount: number) {
        this.myRackCount.next(newRack.length);
        this.opponentRackCount.next(opponentCount);
        this.rack.next(newRack);
    }

    tempUpdateRack(lettersToChange: string) {
        const NOT_FOUND = -1;
        const temporaryRack = this.rack.value;
        if (!lettersToChange.match(/^[a-z]*$/g)) return;
        for (const unwantedLetter of lettersToChange) {
            const idx = temporaryRack.findIndex((letter) => {
                return unwantedLetter === letter.name.toLowerCase() || letter.name === '*';
            });
            if (idx === NOT_FOUND) return;
            temporaryRack.splice(idx, 1);
        }
        this.rack.next(temporaryRack);
    }
}
