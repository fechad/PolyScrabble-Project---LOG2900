import { EndGameCalculator } from '@app/classes/end-game-calculator';
import { Letter } from '@app/letter';
import { Message } from '@app/message';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { EventEmitter } from 'events';
import { Board } from './board';
import { Parameters } from './parameters';
import { Reserve } from './reserve';
import { Player, PlayerId } from './room';

export type GameId = number;
type Tile = Letter | undefined;
type SendableBoard = Tile[][];

export const MAIN_PLAYER = 0;
export const OTHER_PLAYER = 1;
const PLAYER_0_TURN_PROBABILITY = 0.5;
const BOARD_LENGTH = 15;
const MAX_SKIP_IN_A_ROW = 6;
const MINIMUM_EXCHANGE_RESERVE_COUNT = 7;

type PlayerInfo = {
    info: Player;
    score: number;
    rackCount: number;
};

type GameState = {
    players: PlayerInfo[];
    reserveCount: number;
    board: Tile[][];
    turn: PlayerId;
    ended: boolean;
    winner?: PlayerId;
    summary?: string;
};

export class Game {
    readonly eventEmitter = new EventEmitter();
    readonly reserve = new Reserve();
    readonly board: Board;
    readonly messages: Message[] = [];
    readonly scores: number[] = [0, 0];
    private isPlayer0Turn: boolean;
    private skipCounter;
    private ended: boolean = false;
    private winner: PlayerId | undefined = undefined;
    private summary: string | undefined = undefined;

    constructor(readonly gameId: GameId, readonly players: Player[], private parameters: Parameters, dictionnaryService: DictionnaryService) {
        this.board = new Board(dictionnaryService);
        setTimeout(() => {
            /* empty */
        }, this.parameters.timer);
        this.isPlayer0Turn = Math.random() >= PLAYER_0_TURN_PROBABILITY;
        this.skipCounter = 0;
    }

    sendState() {
        const state: GameState = {
            players: [
                { info: this.players[MAIN_PLAYER], score: this.scores[MAIN_PLAYER], rackCount: this.reserve.letterRacks[MAIN_PLAYER].length },
                { info: this.players[OTHER_PLAYER], score: this.scores[OTHER_PLAYER], rackCount: this.reserve.letterRacks[OTHER_PLAYER].length },
            ],
            reserveCount: this.reserve.getCount(),
            board: this.formatSendableBoard(),
            turn: this.getCurrentPlayer().id,
            ended: this.ended,
            winner: this.winner,
            summary: this.summary,
        };
        this.eventEmitter.emit('state', state);
        this.eventEmitter.emit('rack', this.players[MAIN_PLAYER].id, this.reserve.letterRacks[MAIN_PLAYER]);
        this.eventEmitter.emit('rack', this.players[OTHER_PLAYER].id, this.reserve.letterRacks[OTHER_PLAYER]);
    }

    message(message: Message) {
        this.messages.push(message);
        this.eventEmitter.emit('message', message);
    }

    async placeLetters(playerId: PlayerId, letters: string, row: number, col: number, isHorizontal?: boolean) {
        if (this.checkTurn(playerId)) {
            const playerIndex = this.isPlayer0Turn ? MAIN_PLAYER : OTHER_PLAYER;
            const player = this.getCurrentPlayer();
            try {
                const response = await this.board.placeWord(letters, row, col, isHorizontal);
                this.reserve.updateReserve(letters, this.isPlayer0Turn, false);
                this.scores[playerIndex] += response;
                const position = (isHorizontal ? 'h' : 'v') + row + col;
                const validMessage = player.name + ' : !placer ' + position + ' ' + letters;
                this.eventEmitter.emit('message', { text: validMessage, emitter: 'local' } as Message);
            } catch (e) {
                this.eventEmitter.emit('game-error', player.id, e.message);
            }
            this.nextTurn(player.id, false);
            if (this.reserve.getCount() === 0 && (this.reserve.isPlayerRackEmpty(MAIN_PLAYER) || this.reserve.isPlayerRackEmpty(OTHER_PLAYER))) {
                this.endGame();
            }
            this.sendState();
        }
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
                this.nextTurn(playerId, false);
            } else {
                this.eventEmitter.emit('game-error', playerId, new Error('La réserve est trop petite pour y échanger des lettres').message);
            }
            this.sendState();
        }
    }

    nextTurn(playerId: PlayerId, userRequest: boolean) {
        if (this.checkTurn(playerId)) {
            this.isPlayer0Turn = !this.isPlayer0Turn;

            if (userRequest) this.skipCounter += 1;
            else this.skipCounter = 0;

            if (this.skipCounter === MAX_SKIP_IN_A_ROW) this.endGame();
        }
    }

    forfeit(idLoser: PlayerId) {
        this.ended = true;
        this.winner = idLoser === this.players[MAIN_PLAYER].id ? this.players[OTHER_PLAYER].id : this.players[MAIN_PLAYER].id;
        this.summary = '👑 Votre adversaire a abandonné, vous avez gagné! 👑';
        this.sendState();
    }

    getWinner(): PlayerId | undefined {
        const finalScores = EndGameCalculator.calculateFinalScores(this.scores, this.reserve);
        if (finalScores[MAIN_PLAYER] > finalScores[OTHER_PLAYER]) return this.players[MAIN_PLAYER].id;
        else if (finalScores[MAIN_PLAYER] < finalScores[OTHER_PLAYER]) return this.players[OTHER_PLAYER].id;
        return undefined;
    }

    endGame() {
        this.ended = true;
        this.winner = this.getWinner();
        this.summary = EndGameCalculator.createGameSummaryMessage(
            this.players.map((p) => p),
            this.reserve,
        );
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
