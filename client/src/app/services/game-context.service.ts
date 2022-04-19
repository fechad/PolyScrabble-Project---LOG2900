import { Injectable } from '@angular/core';
import { ChatLog, MessageType } from '@app/classes/chat-log';
import { GameState, PlayerInfo } from '@app/classes/game';
import { Letter } from '@app/classes/letter';
import { Message } from '@app/classes/message';
import { Rack } from '@app/classes/rack';
import { PlayerId, State } from '@app/classes/room';
import * as cst from '@app/constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Socket } from 'socket.io-client';
import swal from 'sweetalert2';

export type Tile = Letter | null;
export type Board = Tile[][];
export type Objective = { text: string; score: number; isPublic: boolean; available: boolean; mine: boolean };
export type ReserveContent = { [letter: string]: number };

@Injectable({
    providedIn: 'root',
})
export class GameContextService {
    readonly rack: Rack = new Rack();
    readonly chatLog: ChatLog = new ChatLog();
    readonly objectives: BehaviorSubject<Objective[]> = new BehaviorSubject([] as Objective[]);
    readonly state: BehaviorSubject<GameState>;
    skipTurnEnabled: boolean = true;
    tempRack: Letter[];
    myId: PlayerId;
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
                { id: '0', avatar: 'a', name: 'P1', connected: true, virtual: false },
                { id: '1', avatar: 'b', name: 'P2', connected: true, virtual: false },
            ].map((info) => ({ info, score: 0, rackCount: cst.NORMAL_RACK_LENGTH })),
            reserveCount: cst.DEFAULT_RESERVE,
            board,
            turn,
            state: State.Started,
        };
        this.state = new BehaviorSubject(state);
        this.chatLog.successfulSending = (message: string) => {
            if (this.socket?.disconnected) {
                this.serverDownAlert();
                return false;
            }
            this.socket?.emit('message', message);
            return true;
        };
    }

    init(socket: Socket) {
        this.socket = socket;
        socket.on('state', (state: GameState) => this.state.next(state));
        socket.on('message', (message: Message, msgCount: number) => {
            this.chatLog.receiveMessages(message, msgCount, message.emitter === this.myId);
        });
        socket.on('game-error', (error: string) => this.chatLog.addMessage(error, MessageType.Local));
        socket.on('valid-exchange', (response: string) => this.chatLog.addMessage(response, MessageType.Command));
        socket.on('rack', (rack: Letter[]) => {
            this.rack.rack.next(rack);
            this.allowSwitch(true);
        });
        socket.on('reserve-content', (sortedReserve: ReserveContent) => {
            const message = Object.entries(sortedReserve)
                .map(([letter, qty]) => `${letter} : ${qty}`)
                .join('\n');
            this.chatLog.addMessage(message, MessageType.Command);
        });
        socket.on('objectives', (objectives: Objective[]) => {
            this.objectives.next(objectives);
        });
    }

    close() {
        this.socket?.close();
        this.socket = undefined;
        this.chatLog.clearMessages();
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

    switchTurn(timerRequest: boolean) {
        if (this.socket?.disconnected) return this.serverDownAlert();
        else this.socket?.emit('switch-turn', timerRequest);
    }

    place(letters: string, rowIndex: number, columnIndex: number, isHorizontal?: boolean) {
        if (this.socket?.disconnected) {
            setTimeout(() => {
                this.serverDownAlert();
            }, cst.SEC_TO_MS);
        }
        this.rack.tempUpdate();
        this.allowSwitch(false);
        this.socket?.emit('place-letters', letters, rowIndex, columnIndex, isHorizontal);
    }

    exchange(letters: string) {
        if (this.socket?.disconnected) return this.serverDownAlert();
        else this.socket?.emit('change-letters', letters);
    }

    hint() {
        if (this.socket?.disconnected) return this.serverDownAlert();
        else this.socket?.emit('hint');
    }

    getReserve() {
        if (this.socket?.disconnected) return this.serverDownAlert();
        else this.socket?.emit('reserve-content');
    }

    syncRack() {
        if (this.socket?.disconnected) return this.serverDownAlert();
        else
            this.socket?.emit(
                'current-rack',
                this.rack.rack.value.map((letter) => letter.name),
            );
    }

    confirmForfeit() {
        this.socket?.emit('confirm-forfeit');
    }

    private serverDownAlert() {
        swal.fire({
            title: 'Oh non!',
            text: "Vous n'êtes pas connecté au serveur actuellement",
            showCloseButton: true,
            confirmButtonText: 'Compris!',
        });
    }
}
