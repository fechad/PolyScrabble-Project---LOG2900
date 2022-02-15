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

export class Game {
    readonly eventEmitter = new EventEmitter();
    readonly reserve = new Reserve();
    readonly messages: Message[] = [];
    readonly board: Board;
    private isPlayer0Turn: boolean;

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
            try {
                const response = await this.board.placeWord(letters, position);
                this.reserve.updateReserve(letters, this.isPlayer0Turn, false);
                this.eventEmitter.emit('score', response, playerId);
                const validMessage = this.getPlayerName() + ' : !placer ' + position + ' ' + letters;
                this.eventEmitter.emit('valid-command', validMessage);
                this.getReserveCount();
            } catch (e) {
                this.eventEmitter.emit('game-error', playerId, e.message);
            }
            this.eventEmitter.emit('board', this.formatSendableBoard());
            this.sendRack();
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
        }
    }

    skipTurn(playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            this.isPlayer0Turn = !this.isPlayer0Turn;
            this.eventEmitter.emit('turn', this.getPlayerId(true));
        }
    }

    forfeit(idLoser: string | undefined) {
        this.eventEmitter.emit('forfeit', idLoser);
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
