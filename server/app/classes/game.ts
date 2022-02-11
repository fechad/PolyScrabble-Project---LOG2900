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
const STANDARD_GAME_PLAYER_NUMBER = 2;
const MAIN_PLAYER = 0;
const OTHER_PLAYER = 1;
const PLAYER_0_TURN_PROBABILITY = 0.5;
const BOARD_LENGTH = 15;

export class Game {
    readonly gameId: GameId;
    readonly eventEmitter = new EventEmitter();
    readonly reserve = new Reserve();
    readonly players: Player[];
    readonly messages: Message[] = [];
    readonly board: Board;
    private parameters: Parameters;
    private isPlayer0Turn: boolean;
    private nbOfPlayersReady = 0;

    constructor(id: GameId, players: Player[], parameters: Parameters, dictionnaryService: DictionnaryService) {
        this.board = new Board(dictionnaryService);
        this.gameId = id;
        this.parameters = parameters;
        this.players = players;
        this.isPlayer0Turn = Math.random() >= PLAYER_0_TURN_PROBABILITY;
    }

    gameInit() {
        this.nbOfPlayersReady++;
        if (this.nbOfPlayersReady === STANDARD_GAME_PLAYER_NUMBER) {
            this.eventEmitter.emit('rack', this.reserve.letterRacks[MAIN_PLAYER], this.players[MAIN_PLAYER].id);
            this.eventEmitter.emit('rack', this.reserve.letterRacks[OTHER_PLAYER], this.players[OTHER_PLAYER].id);
            this.eventEmitter.emit('turn', this.getPlayerTurnId());
            this.eventEmitter.emit('players', this.players);
        }
    }

    message(message: Message) {
        this.messages.push(message);
        this.eventEmitter.emit('message', message);
    }

    placeLetters(letters: string, position: string, playerId: PlayerId) {
        if (this.checkTurn(playerId, false)) {
            // TODO: make verifications (probably return game-error)
            // TODO: calculate points
            // TODO: emit the result
            const response = this.board.placeWord(letters, position);
            if (typeof response !== typeof Error) {
                const board = this.formatSendableBoard();
                this.eventEmitter.emit('board', board);
                this.eventEmitter.emit('score', response, playerId);
                // this.skipTurn(playerId, false);
            } else {
                const error = response as Error;
                this.eventEmitter.emit('game-error', error.message, playerId);
            }
        }
    }

    changeLetters(letters: string, playerId: PlayerId) {
        if (this.checkTurn(playerId, false)) {
            // TODO: change the letters in the service
            // TODO: emit the new rack
            this.eventEmitter.emit('rack', letters, playerId);
        }
    }

    getParameters() {
        this.eventEmitter.emit('parameters', this.parameters);
    }

    skipTurn(playerId: PlayerId, timerRequest: boolean) {
        if (this.checkTurn(playerId, timerRequest)) {
            this.isPlayer0Turn = !this.isPlayer0Turn;
            this.eventEmitter.emit('turn', this.getPlayerTurnId());
        }
    }

    private getPlayerTurnId() {
        return this.isPlayer0Turn ? this.players[MAIN_PLAYER].id : this.players[OTHER_PLAYER].id;
    }

    private checkTurn(playerId: PlayerId, timerRequest: boolean) {
        const validTurn = playerId === this.getPlayerTurnId();
        if (!validTurn && timerRequest === false) {
            this.eventEmitter.emit('game-error', new Error("Ce n'est pas votre tour"));
        } else if (!validTurn && timerRequest === true) {
            return false;
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
}
