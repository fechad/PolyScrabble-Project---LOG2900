import { Message } from '@app/message';
import { EventEmitter } from 'events';
import { Parameters } from './parameters';
import { Player, PlayerId } from './room';

export type GameId = number;

export class Game {
    readonly gameId: GameId;
    readonly eventEmitter = new EventEmitter();

    readonly players: Player[];
    readonly messages: Message[] = [];
    private parameters: Parameters;
    private isPlayer0Turn = true;

    constructor(id: GameId, players: Player[], parameters: Parameters) {
        this.gameId = id;
        this.parameters = parameters;
        this.players = players;
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
            const points = 26;
            this.eventEmitter.emit('placed', letters, position, points, playerId);
        }
    }

    changeLetters(letters: string, playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            // TODO: change the letters in the service
            // TODO: emit the new rack
            this.eventEmitter.emit('rack', letters, playerId);
        }
    }

    getParameters() {
        this.eventEmitter.emit('parameters', this.parameters);
    }

    skipTurn(playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            this.isPlayer0Turn = !this.isPlayer0Turn;
            this.eventEmitter.emit('turn', this.isPlayer0Turn);
        }
    }

    private checkTurn(playerId: PlayerId) {
        const validTurn = playerId === (this.isPlayer0Turn ? this.players[0].id : this.players[1].id);
        if (!validTurn) {
            this.eventEmitter.emit('game-error', new Error("Ce n'est pas votre tour"));
        }
        return validTurn;
    }
}
