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
            const points = 26;
            this.eventEmitter.emit('placed', letters, position, points, playerId);
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
}
