import { Letter } from '@app/letter';
import { Message } from '@app/message';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { EndGameService } from '@app/services/end-game.service';
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

export class Game {
    readonly eventEmitter = new EventEmitter();
    readonly reserve = new Reserve();
    readonly endGameService = new EndGameService();
    readonly messages: Message[] = [];
    readonly board: Board;
    readonly scores: number[] = [0, 0];
    private isPlayer0Turn: boolean;
    private skipCounter = 0;

    constructor(readonly gameId: GameId, readonly players: Player[], private parameters: Parameters, dictionnaryService: DictionnaryService) {
        this.board = new Board(dictionnaryService);
        setTimeout(() => this.eventEmitter.emit('dummy'), this.parameters.timer);
        this.isPlayer0Turn = Math.random() >= PLAYER_0_TURN_PROBABILITY;
    }

    gameInit() {
        this.eventEmitter.emit('board', this.formatSendableBoard());
        this.eventEmitter.emit('rack', this.players[MAIN_PLAYER].id, this.reserve.letterRacks[MAIN_PLAYER]);
        this.eventEmitter.emit('rack', this.players[OTHER_PLAYER].id, this.reserve.letterRacks[OTHER_PLAYER]);
        this.eventEmitter.emit('turn', this.getPlayerId(true));
        this.eventEmitter.emit('players', this.players);
        this.getReserveCount();
    }

    message(message: Message) {
        this.messages.push(message);
        this.eventEmitter.emit('message', message);
    }

    async placeLetters(letters: string, position: string, playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            const playerIndex = this.isPlayer0Turn ? MAIN_PLAYER : OTHER_PLAYER;
            try {
                const response = await this.board.placeWord(letters, position);
                this.reserve.updateReserve(letters, this.isPlayer0Turn, false);
                this.eventEmitter.emit('score', response, playerId);
                this.scores[playerIndex] += response;
                const validMessage = this.getPlayerName() + ' : !placer ' + position + ' ' + letters;
                this.eventEmitter.emit('valid-command', validMessage);
                this.getReserveCount();
                this.updateSkipCounter(false);
            } catch (e) {
                this.eventEmitter.emit('game-error', playerId, e.message);
            }
            this.eventEmitter.emit('board', this.formatSendableBoard());
            this.sendRack();
            this.skipTurn(playerId);
            if (this.reserve.getCount() === 0 && (this.reserve.isPlayerRackEmpty(MAIN_PLAYER) || this.reserve.isPlayerRackEmpty(OTHER_PLAYER))) {
                this.endGame();
            }
        }
    }

    getPlayerName() {
        const playerIndex = this.isPlayer0Turn ? MAIN_PLAYER : OTHER_PLAYER;
        return this.players[playerIndex].name;
    }

    changeLetters(letters: string, playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            this.reserve.updateReserve(letters, this.isPlayer0Turn, true);
            this.sendRack();
            let validMessage = 'Vous avez échangé les lettres:  ' + letters;
            this.eventEmitter.emit('valid-exchange', playerId, validMessage);
            validMessage = this.getPlayerName() + ' a échangé ' + letters.length + ' lettres';
            const opponentId = this.getPlayerId(false);
            this.eventEmitter.emit('valid-exchange', opponentId, validMessage);
            this.skipTurn(playerId);
            this.updateSkipCounter(false);
        }
    }

    skipTurn(playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            this.isPlayer0Turn = !this.isPlayer0Turn;
            this.eventEmitter.emit('turn', this.getPlayerId(true));
            this.updateSkipCounter(true);
        }
    }

    updateSkipCounter(playerSkip: boolean) {
        if (playerSkip) {
            this.skipCounter += 1;
            if (this.skipCounter === MAX_SKIP_IN_A_ROW) this.endGame();
        } else this.skipCounter = 0;
    }

    forfeit(idLoser: string | undefined) {
        this.eventEmitter.emit('forfeit', idLoser);
    }

    endGame() {
        const finalScores = this.endGameService.calculateFinalScores(this.scores, this.reserve);
        this.eventEmitter.emit('score', finalScores[MAIN_PLAYER], this.players[MAIN_PLAYER].id);
        this.eventEmitter.emit('score', finalScores[OTHER_PLAYER], this.players[OTHER_PLAYER].id);
        this.eventEmitter.emit('game-summary', this.endGameService.createGameSummaryMessage(this.players));
        this.eventEmitter.emit('congratulations', this.getWinner(finalScores));
    }

    getWinner(finalScores: number[]): Player {
        if (finalScores[MAIN_PLAYER] > finalScores[OTHER_PLAYER]) return this.players[MAIN_PLAYER];
        else if (finalScores[MAIN_PLAYER] < finalScores[OTHER_PLAYER]) return this.players[OTHER_PLAYER];
        else {
            this.eventEmitter.emit('its-a-tie', this.players[MAIN_PLAYER], this.players[OTHER_PLAYER]);
        }
        return { id: 'equalScore', name: '', connected: true };
    }

    getReserveCount() {
        this.eventEmitter.emit('reserve', this.reserve.getCount());
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
                let tile: Tile;
                if (!gameTile.empty) {
                    tile = gameTile.letter;
                } else {
                    tile = undefined;
                }
                row.push(tile);
            }
            board.push(row);
        }
        return board;
    }

    private sendRack() {
        if (this.isPlayer0Turn) {
            this.eventEmitter.emit(
                'rack',
                this.players[MAIN_PLAYER].id,
                this.reserve.letterRacks[MAIN_PLAYER],
                this.reserve.letterRacks[OTHER_PLAYER].length,
            );
        } else {
            this.eventEmitter.emit(
                'rack',
                this.players[OTHER_PLAYER].id,
                this.reserve.letterRacks[OTHER_PLAYER],
                this.reserve.letterRacks[MAIN_PLAYER].length,
            );
        }
    }
}
