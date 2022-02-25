import { Injectable } from '@angular/core';
import { CommandParsing } from '@app/classes/command-parsing';
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
    tempRack: Letter[];
    private msgCount: number = 0;
    private commandParser: CommandParsing = new CommandParsing();

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

    addMessage(message: string, local: boolean, command: boolean) {
        if (local) {
            this.messages.next([...this.messages.value, { text: message, emitter: 'local' }]);
        } else if (command) {
            this.messages.next([...this.messages.value, { text: message, emitter: 'command' }]);
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

    tempUpdateRack() {
        this.rack.next(this.tempRack);
    }

    isInMyRack(letters: string) {
        let response = true;
        const NOT_FOUND = -1;
        const tempRack = this.rack.value;
        for (const letter of letters) {
            const index = tempRack.findIndex((foundLetter) => {
                return letter === foundLetter.name.toLowerCase() || (foundLetter.name === '*' && this.commandParser.isUpperCaseLetter(letter));
            });
            if (index === NOT_FOUND) response = false;
            tempRack[index] = tempRack[tempRack.length - 1];
            tempRack.pop();
        }
        if (response) this.tempRack = tempRack;
        return response;
    }
}
