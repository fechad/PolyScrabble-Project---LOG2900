import { Letter } from '@app/letter';
import { Message } from '@app/message';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { EventEmitter } from 'events';
import { Board } from './board';
import { Parameters } from './parameters';
import { Reserve } from './reserve';
import { Player, PlayerId } from './room';

export type GameId = number;
const STANDARD_GAME_PLAYER_NUMBER = 2;
const MAIN_PLAYER = 0;
const OTHER_PLAYER = 1;
const PLAYER_0_TURN_PROBABILITY = 0.5;
const BOARD_LENGTH = 15;

type Tile = Letter | undefined;
type SendableBoard = Tile[][];

export class Game {
    readonly eventEmitter = new EventEmitter();
    readonly reserve = new Reserve();
    readonly messages: Message[] = [];
    readonly board: Board;
    private isPlayer0Turn: boolean;
    private nbOfPlayersReady = 0;

    constructor(readonly gameId: GameId, readonly players: Player[], private parameters: Parameters, dictionnaryService: DictionnaryService) {
        this.board = new Board(dictionnaryService);
        setTimeout(function () {}, this.parameters.timer);
        this.isPlayer0Turn = Math.random() >= PLAYER_0_TURN_PROBABILITY;
    }

    gameInit() {
        this.nbOfPlayersReady++;
        if (this.nbOfPlayersReady === STANDARD_GAME_PLAYER_NUMBER) {
            this.eventEmitter.emit('rack', this.players[MAIN_PLAYER].id, this.reserve.letterRacks[MAIN_PLAYER]);
            this.eventEmitter.emit('rack', this.players[OTHER_PLAYER].id, this.reserve.letterRacks[OTHER_PLAYER]);
            this.eventEmitter.emit('turn', this.getPlayerTurnId());
            this.eventEmitter.emit('players', this.players);
        }
    }

    message(message: Message) {
        this.messages.push(message);
        this.eventEmitter.emit('message', message);
    }

    placeLetters(letters: string, position: string, playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            // TODO: make verifications (probably return game-error)
            // TODO: calculate points
            // TODO: emit the result
            try {
                const response = this.board.placeWord(letters, position);
                const board = this.formatSendableBoard();
                this.eventEmitter.emit('board', board);
                this.eventEmitter.emit('score', response, playerId);
            } catch (e) {
                this.eventEmitter.emit('game-error', e.message, playerId);
            }
        }
    }

    changeLetters(letters: string, playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            // TODO: change the letters in the service
            // TODO: emit the new rack
            this.eventEmitter.emit('rack', playerId, letters);
        }
    }

    skipTurn(playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            this.isPlayer0Turn = !this.isPlayer0Turn;
            this.eventEmitter.emit('turn', this.getPlayerTurnId());
        }
    }

    forfeit(idLoser: string | undefined) {
        this.eventEmitter.emit('forfeit', idLoser);
    }

    private getPlayerTurnId() {
        return this.isPlayer0Turn ? this.players[MAIN_PLAYER].id : this.players[OTHER_PLAYER].id;
    }

    private checkTurn(playerId: PlayerId) {
        const validTurn = playerId === this.getPlayerTurnId();
        if (!validTurn) {
            this.eventEmitter.emit('game-error', new Error("Ce n'est pas votre tour"));
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
