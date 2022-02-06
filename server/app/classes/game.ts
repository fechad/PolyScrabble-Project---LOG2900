import { Message } from '@app/message';
import { EventEmitter } from 'events';
import { Parameters } from './parameters';
import { Player, PlayerId } from './room';

export type GameId = number;

export class Game {
    readonly gameId: GameId;
    readonly eventEmitter = new EventEmitter();

    private messages: Message[];
    readonly players: Player[];
    private parameters: Parameters;
    private isPlayer0Turn;

    constructor(id: GameId, players: Player[], parameters: Parameters) {
        this.gameId = id;
        this.parameters = parameters;
        this.messages = [];
        this.players = players;
        this.isPlayer0Turn = true;
    }

    message(message: Message) {
        this.messages.push(message);
        this.eventEmitter.emit('message', message);
    }

    getParameters() {
        this.eventEmitter.emit('parameters', this.parameters);
    }

    skipTurn(playerId: PlayerId){
        if(playerId === (this.isPlayer0Turn ? this.players[0].id : this.players[1].id)){
            this.isPlayer0Turn = !this.isPlayer0Turn;
            this.eventEmitter.emit('turn', this.isPlayer0Turn);
        } else {
            this.eventEmitter.emit('gameError', new Error('Ce n\'est pas votre tour'));
        }
    }
}
