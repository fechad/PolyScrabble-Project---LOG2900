import { EndGameCalculator } from '@app/classes/end-game-calculator';
import * as cst from '@app/constants';
import { Letter } from '@app/letter';
import { Message } from '@app/message';
import { DictionnaryTrieService } from '@app/services/dictionnary-trie.service';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { EventEmitter } from 'events';
import { Container } from 'typedi';
import { Board } from './board';
import { Reserve } from './reserve';
import { Player, PlayerId, Room, State } from './room';
import { VirtualPlayer } from './virtual-player';

export type GameId = number;
type Tile = Letter | undefined;
type SendableBoard = Tile[][];

type PlayerInfo = {
    info: Player;
    score: number;
    rackCount: number;
};

type GameState = {
    players: PlayerInfo[];
    reserveCount: number;
    board: Tile[][];
    turn?: PlayerId;
    state: State;
    winner?: PlayerId;
};

export class Game {
    readonly eventEmitter = new EventEmitter();
    readonly reserve = new Reserve();
    readonly board: Board;
    readonly messages: Message[] = [];
    readonly scores: number[] = [0, 0];
    readonly players: Player[];
    private isPlayer0Turn: boolean;
    private skipCounter;
    private winner: PlayerId | undefined = undefined;
    private timeout: NodeJS.Timeout | undefined = undefined;

    constructor(private room: Room, dictionnaryService: DictionnaryService) {
        if (room.getOtherPlayer() === undefined) throw new Error('Tried to create game with only one player');
        this.players = [room.mainPlayer, room.getOtherPlayer() as Player];
        this.board = new Board(dictionnaryService);
        this.timeout = setTimeout(() => this.timeoutHandler(), this.room.parameters.timer * cst.SEC_TO_MS);
        this.isPlayer0Turn = Math.random() >= cst.PLAYER_0_TURN_PROBABILITY;
        this.skipCounter = 0;
    }

    private static createCommand(word: string, row: number, col: number, isHorizontal?: boolean): string {
        const columnOnBoard = col + 1;
        const rowOnBoard = String.fromCharCode(row + cst.ASCII_LOWERCASE_A);
        const orientation = isHorizontal !== null ? (isHorizontal ? 'h' : 'v') : '';
        const position = rowOnBoard + columnOnBoard + orientation;
        return `!placer ${position} ${word}`;
    }

    get id(): number {
        return this.room.id;
    }

    clearTimeout() {
        if (this.timeout === undefined) return;
        clearTimeout(this.timeout);
        this.timeout = undefined;
    }

    sendState() {
        const state: GameState = {
            players: [this.getPlayerInfo(this.players[cst.MAIN_PLAYER].id), this.getPlayerInfo(this.players[cst.OTHER_PLAYER].id)],
            reserveCount: this.reserve.getCount(),
            board: this.formatSendableBoard(),
            turn: this.room.getState() === State.Started ? this.getCurrentPlayer().id : undefined,
            state: this.room.getState(),
            winner: this.winner,
        };
        this.eventEmitter.emit('state', state);
        this.eventEmitter.emit('rack', this.players[cst.MAIN_PLAYER].id, this.reserve.letterRacks[cst.MAIN_PLAYER]);
        this.eventEmitter.emit('rack', this.players[cst.OTHER_PLAYER].id, this.reserve.letterRacks[cst.OTHER_PLAYER]);
    }

    getPlayerInfo(id: PlayerId): PlayerInfo {
        let idx;
        if (id === this.players[cst.MAIN_PLAYER].id) {
            idx = cst.MAIN_PLAYER;
        } else if (id === this.players[cst.OTHER_PLAYER].id) {
            idx = cst.OTHER_PLAYER;
        } else {
            throw new Error('Not one of the players');
        }
        return { info: this.players[idx], score: this.scores[idx], rackCount: this.reserve.letterRacks[idx].length };
    }

    message(message: Message) {
        this.messages.push(message);
        this.eventEmitter.emit('message', message);
    }

    async placeLetters(playerId: PlayerId, letters: string, row: number, col: number, isHorizontal?: boolean) {
        if (this.checkTurn(playerId)) {
            const playerIndex = this.isPlayer0Turn ? cst.MAIN_PLAYER : cst.OTHER_PLAYER;
            const player = this.getCurrentPlayer();
            this.clearTimeout();
            try {
                const response = await this.board.placeWord(letters, row, col, isHorizontal);
                this.reserve.updateReserve(letters, this.isPlayer0Turn, false);
                this.scores[playerIndex] += response;
                const validMessage = player.name + ' : ' + Game.createCommand(letters, row, col, isHorizontal);
                this.eventEmitter.emit('message', { text: validMessage, emitter: 'command' } as Message);
            } catch (e) {
                this.eventEmitter.emit('message', { text: player.name + ' a fait un mauvais placement', emitter: 'command' } as Message);
                this.eventEmitter.emit('game-error', player.id, e.message);
            }
            this.nextTurn(false);
            if (this.reserve.getCount() === 0 && this.emptiedRack()) {
                this.endGame();
            }
            this.sendState();
        }
    }

    emptiedRack(): boolean {
        return this.reserve.isPlayerRackEmpty(cst.MAIN_PLAYER) || this.reserve.isPlayerRackEmpty(cst.OTHER_PLAYER);
    }

    matchRack(rack: Letter[]) {
        this.reserve.matchRack(rack, this.isPlayer0Turn);
    }

    getCurrentPlayer(): Player {
        const playerIndex = this.isPlayer0Turn ? cst.MAIN_PLAYER : cst.OTHER_PLAYER;
        return this.players[playerIndex];
    }

    changeLetters(letters: string, playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            if (this.reserve.getCount() >= cst.MINIMUM_EXCHANGE_RESERVE_COUNT) {
                this.reserve.updateReserve(letters, this.isPlayer0Turn, true);
                let validMessage = 'Vous avez échangé les lettres:  ' + letters;
                this.eventEmitter.emit('valid-exchange', playerId, validMessage);
                validMessage = this.getCurrentPlayer().name + ' a échangé ' + letters.length + ' lettres';
                const opponentId = this.getPlayerId(false);
                this.eventEmitter.emit('valid-exchange', opponentId, validMessage);
                this.nextTurn(false);
            } else {
                this.eventEmitter.emit('game-error', playerId, new Error('La réserve est trop petite pour y échanger des lettres').message);
            }
            this.sendState();
        }
    }

    hint(playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            const virtual = new VirtualPlayer(false, this, Container.get(DictionnaryService), Container.get(DictionnaryTrieService));
            const player = playerId === this.players[cst.MAIN_PLAYER].id ? cst.MAIN_PLAYER : cst.OTHER_PLAYER;
            const options = virtual.chooseWord(this.reserve.letterRacks[player].map((letter) => letter.name).join('')).slice(0, 3);
            const warning =
                options.length === 0 ? 'Aucun placement possible' : options.length < cst.HINT_NUMBER_OPTIONS ? 'Moins de 3 placements possible' : '';
            const hintMessage =
                'Indice:\n' +
                options.map((opt, i) => ` ${i + 1}. ${Game.createCommand(opt.command, opt.row, opt.col, opt.isHorizontal)}`).join('\n') +
                warning;
            this.eventEmitter.emit('valid-exchange', playerId, hintMessage);
        }
    }

    skipTurn(playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            const validMessage = this.getCurrentPlayer().name + ' a passé son tour !';
            this.eventEmitter.emit('message', { text: validMessage, emitter: 'command' } as Message);
            this.nextTurn(true);
            this.sendState();
        }
    }

    showReserveContent(playerId: PlayerId) {
        this.eventEmitter.emit('reserve-content', playerId, this.reserve.getContent());
    }

    forfeit(idLoser: PlayerId) {
        if (this.room.getState() !== State.Started) return;
        this.room.end(true);
        this.winner = idLoser === this.players[cst.MAIN_PLAYER].id ? this.players[cst.OTHER_PLAYER].id : this.players[cst.MAIN_PLAYER].id;
        this.sendState();
    }

    getWinner(): string | undefined {
        if (this.scores[cst.MAIN_PLAYER] > this.scores[cst.OTHER_PLAYER]) return this.players[cst.MAIN_PLAYER].id;
        else if (this.scores[cst.MAIN_PLAYER] < this.scores[cst.OTHER_PLAYER]) return this.players[cst.OTHER_PLAYER].id;
        return undefined;
    }

    endGame() {
        EndGameCalculator.calculateFinalScores(this.scores, this.reserve);
        this.room.end(false);
        this.winner = this.getWinner();
        this.eventEmitter.emit('message', {
            text: EndGameCalculator.createGameSummaryMessage(
                this.players.map((p) => p),
                this.reserve,
            ),
            emitter: 'local',
        } as Message);
    }

    private timeoutHandler() {
        this.nextTurn(true);
        this.sendState();
    }

    private nextTurn(userRequest: boolean) {
        this.isPlayer0Turn = !this.isPlayer0Turn;

        if (userRequest) this.skipCounter += 1;
        else this.skipCounter = 0;

        if (this.skipCounter === cst.MAX_SKIP_IN_A_ROW) this.endGame();

        if (this.timeout) clearTimeout(this.timeout);
        if (this.room.getState() === State.Started) {
            this.timeout = setTimeout(() => this.timeoutHandler(), this.room.parameters.timer * cst.SEC_TO_MS);
        } else {
            this.timeout = undefined;
        }
    }

    private getPlayerId(isActivePlayer: boolean) {
        return isActivePlayer === this.isPlayer0Turn ? this.players[cst.MAIN_PLAYER].id : this.players[cst.OTHER_PLAYER].id;
    }

    private checkTurn(playerId: PlayerId) {
        const validTurn = playerId === this.getPlayerId(true);
        if (!validTurn) {
            this.eventEmitter.emit('game-error', playerId, new Error("Ce n'est pas votre tour").message);
        }
        return validTurn;
    }

    private formatSendableBoard(): SendableBoard {
        const board: SendableBoard = [];
        for (let i = 0; i < cst.BOARD_LENGTH; i++) {
            const row = [];
            for (let j = 0; j < cst.BOARD_LENGTH; j++) {
                const gameTile = this.board.board[i][j];
                row.push(gameTile.empty ? undefined : gameTile.letter);
            }
            board.push(row);
        }
        return board;
    }
}
