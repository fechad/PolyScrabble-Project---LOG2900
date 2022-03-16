import { EndGameCalculator } from '@app/classes/end-game-calculator';
import { Letter } from '@app/letter';
import { Message } from '@app/message';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { EventEmitter } from 'events';
import { Board } from './board';
import { Reserve } from './reserve';
import { Player, PlayerId, Room, State } from './room';

export type GameId = number;
type Tile = Letter | undefined;
type SendableBoard = Tile[][];

export const MAIN_PLAYER = 0;
export const OTHER_PLAYER = 1;
const PLAYER_0_TURN_PROBABILITY = 0.5;
const BOARD_LENGTH = 15;
const MAX_SKIP_IN_A_ROW = 6;
const MINIMUM_EXCHANGE_RESERVE_COUNT = 7;
const SEC_TO_MS = 1000;
const ASCII_LOWERCASE_A = 97;

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
        this.timeout = setTimeout(() => this.timeoutHandler(), this.room.parameters.timer * SEC_TO_MS);
        this.isPlayer0Turn = room.parameters.difficulty ? true : Math.random() >= PLAYER_0_TURN_PROBABILITY;
        this.skipCounter = 0;
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
            players: [
                this.getPlayerInfo(this.players[MAIN_PLAYER].id) as PlayerInfo,
                this.getPlayerInfo(this.players[OTHER_PLAYER].id) as PlayerInfo,
            ],
            reserveCount: this.reserve.getCount(),
            board: this.formatSendableBoard(),
            turn: this.room.getState() === State.Started ? this.getCurrentPlayer().id : undefined,
            state: this.room.getState(),
            winner: this.winner,
        };
        this.eventEmitter.emit('state', state);
        this.eventEmitter.emit('rack', this.players[MAIN_PLAYER].id, this.reserve.letterRacks[MAIN_PLAYER]);
        this.eventEmitter.emit('rack', this.players[OTHER_PLAYER].id, this.reserve.letterRacks[OTHER_PLAYER]);
    }

    getPlayerInfo(id: PlayerId): PlayerInfo | undefined {
        let idx;
        if (id === this.players[MAIN_PLAYER].id) {
            idx = MAIN_PLAYER;
        } else if (id === this.players[OTHER_PLAYER].id) {
            idx = OTHER_PLAYER;
        } else {
            return undefined;
        }
        return { info: this.players[idx], score: this.scores[idx], rackCount: this.reserve.letterRacks[idx].length };
    }

    message(message: Message) {
        this.messages.push(message);
        this.eventEmitter.emit('message', message);
    }

    async placeLetters(playerId: PlayerId, letters: string, row: number, col: number, isHorizontal?: boolean) {
        if (this.checkTurn(playerId)) {
            const playerIndex = this.isPlayer0Turn ? MAIN_PLAYER : OTHER_PLAYER;
            const player = this.getCurrentPlayer();
            this.clearTimeout();
            try {
                const response = await this.board.placeWord(letters, row, col, isHorizontal);
                this.reserve.updateReserve(letters, this.isPlayer0Turn, false);
                this.scores[playerIndex] += response;
                const columnOnBoard = col + 1;
                const rowOnBoard = String.fromCharCode(row + ASCII_LOWERCASE_A);
                const orientation = isHorizontal !== null ? (isHorizontal ? 'h' : 'v') : '';
                const position = rowOnBoard + columnOnBoard + orientation;
                const validMessage = player.name + ' : !placer ' + position + ' ' + letters;
                this.eventEmitter.emit('message', { text: validMessage, emitter: 'command' } as Message);
            } catch (e) {
                this.eventEmitter.emit('game-error', player.id, e.message);
            }
            this.nextTurn(false);
            if (this.reserve.getCount() === 0 && (this.reserve.isPlayerRackEmpty(MAIN_PLAYER) || this.reserve.isPlayerRackEmpty(OTHER_PLAYER))) {
                this.endGame();
            }
            this.sendState();
        }
    }

    matchRack(rack: Letter[]) {
        this.reserve.matchRack(rack, this.isPlayer0Turn);
    }

    getCurrentPlayer(): Player {
        const playerIndex = this.isPlayer0Turn ? MAIN_PLAYER : OTHER_PLAYER;
        return this.players[playerIndex];
    }

    changeLetters(letters: string, playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            if (this.reserve.getCount() >= MINIMUM_EXCHANGE_RESERVE_COUNT) {
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
            const options = ['BOB', 'BOBBY', 'BOBETTE']; // TODO
            const warning = options.length === 0 ? 'Aucun placement possible' : options.length < 3 ? 'Moins de 3 placements possible' : '';
            const hintMessage = 'Indice: vous pouvez placer\n' + options.map((opt) => ` - ${opt}`).join('\n') + warning;
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
        this.winner = idLoser === this.players[MAIN_PLAYER].id ? this.players[OTHER_PLAYER].id : this.players[MAIN_PLAYER].id;
        this.sendState();
    }

    getWinner(): string | undefined {
        const finalScores = EndGameCalculator.calculateFinalScores(this.scores, this.reserve);
        if (finalScores[MAIN_PLAYER] > finalScores[OTHER_PLAYER]) return this.players[MAIN_PLAYER].id;
        else if (finalScores[MAIN_PLAYER] < finalScores[OTHER_PLAYER]) return this.players[OTHER_PLAYER].id;
        return undefined;
    }

    endGame() {
        const winnerInfo = this.getWinner();
        this.room.end(false);
        this.winner = winnerInfo;
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

        if (this.skipCounter === MAX_SKIP_IN_A_ROW) this.endGame();

        if (this.timeout) clearTimeout(this.timeout);
        if (this.room.getState() === State.Started) {
            this.timeout = setTimeout(() => this.timeoutHandler(), this.room.parameters.timer * SEC_TO_MS);
        } else {
            this.timeout = undefined;
        }
    }

    private getPlayerId(isActivePlayer: boolean) {
        return isActivePlayer === this.isPlayer0Turn ? this.players[MAIN_PLAYER].id : this.players[OTHER_PLAYER].id;
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
        for (let i = 0; i < BOARD_LENGTH; i++) {
            const row = [];
            for (let j = 0; j < BOARD_LENGTH; j++) {
                const gameTile = this.board.board[i][j];
                row.push(gameTile.empty ? undefined : gameTile.letter);
            }
            board.push(row);
        }
        return board;
    }
}
