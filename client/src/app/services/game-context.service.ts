import { Injectable } from '@angular/core';
import { GameState, PlayerInfo } from '@app/classes/game';
import { Letter } from '@app/classes/letter';
import { Message } from '@app/classes/message';
import { PlayerId } from '@app/classes/room';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const BOARD_LENGTH = 15;
const NORMAL_RACK_LENGTH = 7;
const RESERVE = 102;
export type Tile = Letter | null;
export type Board = Tile[][];

@Injectable({
    providedIn: 'root',
})
export class GameContextService {
    readonly rack: BehaviorSubject<Letter[]> = new BehaviorSubject([] as Letter[]);
    readonly messages: BehaviorSubject<Message[]> = new BehaviorSubject([] as Message[]);
    readonly tempMessages: BehaviorSubject<string[]> = new BehaviorSubject([] as string[]);
    readonly state: BehaviorSubject<GameState>;
    skipTurnEnabled: boolean = true;
    myId: PlayerId;
    private msgCount: number = 0;

    constructor() {
        const board = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            const row = [];
            for (let j = 0; j < BOARD_LENGTH; j++) {
                row.push(null);
            }
            board.push(row);
        }
        const turn = 'none';
        const state: GameState = {
            players: [
                { id: '0', name: 'P1', connected: true },
                { id: '1', name: 'P2', connected: true },
            ].map((info) => ({ info, score: 0, rackCount: NORMAL_RACK_LENGTH })),
            reserveCount: RESERVE - 2 * NORMAL_RACK_LENGTH,
            board,
            turn,
            ended: false,
        };
        this.state = new BehaviorSubject(state);
    }

    isMyTurn(): Observable<boolean> {
        return this.state.pipe(map((state) => state.turn === this.myId));
    }

    me(): Observable<PlayerInfo> {
        return this.state.pipe(map((state) => state.players.find((player) => player.info.id === this.myId) as PlayerInfo));
    }

    other(): Observable<PlayerInfo> {
        return this.state.pipe(map((state) => state.players.find((player) => player.info.id !== this.myId) as PlayerInfo));
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
