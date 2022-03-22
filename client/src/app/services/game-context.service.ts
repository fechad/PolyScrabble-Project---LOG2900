import { Injectable } from '@angular/core';
import { CommandParsing } from '@app/classes/command-parsing';
import { GameState, PlayerInfo } from '@app/classes/game';
import { Letter } from '@app/classes/letter';
import { Message } from '@app/classes/message';
import { PlayerId, State } from '@app/classes/room';
import * as cst from '@app/constants';
import { ReserveLetter } from '@app/reserve-letter';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Socket } from 'socket.io-client';

export type Tile = Letter | null;
export type Board = Tile[][];

export enum MessageType {
    Normal,
    Command,
    Local,
}

@Injectable({
    providedIn: 'root',
})
export class GameContextService {
    readonly rack: BehaviorSubject<Letter[]> = new BehaviorSubject([] as Letter[]);
    readonly messages: BehaviorSubject<Message[]> = new BehaviorSubject([] as Message[]);
    readonly tempMessages: BehaviorSubject<string[]> = new BehaviorSubject([] as string[]);
    readonly state: BehaviorSubject<GameState>;
    skipTurnEnabled: boolean = true;
    tempRack: Letter[];
    myId: PlayerId;
    private msgCount: number = 0;
    private socket: Socket | undefined = undefined;

    constructor() {
        const board = [];
        for (let i = 0; i < cst.BOARD_LENGTH; i++) {
            const row = [];
            for (let j = 0; j < cst.BOARD_LENGTH; j++) {
                row.push(null);
            }
            board.push(row);
        }
        const turn = 'none';
        const state: GameState = {
            /* Dummy state */
            players: [
                { id: '0', name: 'P1', connected: true, virtual: false },
                { id: '1', name: 'P2', connected: true, virtual: false },
            ].map((info) => ({ info, score: 0, rackCount: cst.NORMAL_RACK_LENGTH })),
            reserveCount: cst.DEFAULT_RESERVE,
            board,
            turn,
            state: State.Started,
        };
        this.state = new BehaviorSubject(state);
    }

    init(socket: Socket) {
        this.socket = socket;
        socket.on('state', (state: GameState) => this.state.next(state));
        socket.on('message', (message: Message, msgCount: number) => {
            this.receiveMessages(message, msgCount, message.emitter === this.myId);
        });
        socket.on('game-error', (error: string) => this.addMessage(error, MessageType.Local));
        socket.on('valid-exchange', (response: string) => this.addMessage(response, MessageType.Command));
        socket.on('rack', (rack: Letter[]) => {
            this.rack.next(rack);
            this.allowSwitch(true);
        });
        socket.on('reserve-content', (sortedReserve: ReserveLetter[]) => {
            const message = sortedReserve.map((letter) => `${letter.name} : ${letter.qtyInReserve}`).join('\n');
            this.addMessage(message, MessageType.Command);
        });
    }

    close() {
        this.socket?.close();
        this.socket = undefined;
        this.clearMessages();
    }

    isEnded(): Observable<boolean> {
        return this.state.pipe(map((state) => state.state === State.Ended || state.state === State.Aborted));
    }

    isMyTurn(): Observable<boolean> {
        return this.state.pipe(map((state) => state.turn === this.myId));
    }

    getMe(): Observable<PlayerInfo> {
        return this.state.pipe(map((state) => state.players.find((player) => player.info.id === this.myId) as PlayerInfo));
    }

    getOther(): Observable<PlayerInfo> {
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
        this.tempMessages.next([]);
    }

    addMessage(message: string, type: MessageType = MessageType.Normal) {
        switch (type) {
            case MessageType.Local:
                this.messages.next([...this.messages.value, { text: message, emitter: 'local' }]);
                break;
            case MessageType.Command:
                this.messages.next([...this.messages.value, { text: message, emitter: 'command' }]);
                break;
            default:
                this.socket?.emit('message', message);
                this.tempMessages.next([...this.tempMessages.value, message]);
                break;
        }
    }

    tempUpdateRack() {
        this.rack.next(this.tempRack);
    }

    attemptTempRackUpdate(letters: string) {
        const tempRack = [...this.rack.value];
        for (const letter of letters) {
            const index = tempRack.findIndex((foundLetter) => {
                return letter === foundLetter.name.toLowerCase() || (foundLetter.name === '*' && CommandParsing.isUpperCaseLetter(letter));
            });
            if (index === cst.MISSING) throw new Error('Ces lettres ne sont pas dans le chevalet');
            tempRack[index] = tempRack[tempRack.length - 1];
            tempRack.pop();
        }
        this.tempRack = tempRack;
    }
    addTempRack(letter: Letter) {
        this.tempRack.push(letter);
    }

    switchTurn(timerRequest: boolean) {
        this.socket?.emit('switch-turn', timerRequest);
    }

    place(letters: string, rowIndex: number, columnIndex: number, isHorizontal?: boolean) {
        this.tempUpdateRack();
        this.allowSwitch(false);
        this.socket?.emit('place-letters', letters, rowIndex, columnIndex, isHorizontal);
    }

    exchange(letters: string) {
        this.socket?.emit('change-letters', letters);
    }

    hint() {
        this.socket?.emit('hint');
    }

    getReserve() {
        this.socket?.emit('reserve-content');
    }

    showMyRack() {
        this.socket?.emit('current-rack', this.rack.value);
    }

    confirmForfeit() {
        this.socket?.emit('confirm-forfeit');
    }
}
