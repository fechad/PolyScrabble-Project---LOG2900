import { EventEmitter } from 'events';
import { Parameters } from './parameters';
import { Player, PlayerId } from './room';

export type GameId = number;
export type Message = { text: string; playerId: PlayerId };

export class Game {
    readonly gameId: GameId;
    readonly eventEmitter = new EventEmitter();

    private messages: Message[];
    private players: Player[];
    private parameters: Parameters;

    constructor(id: GameId, players: Player[], parameters: Parameters) {
        this.gameId = id;
        this.parameters = parameters;
        this.messages = [];
        this.players = players;
    }

    sendMessage(message: Message) {
        this.messages.push(message);
        this.eventEmitter.emit('message', message);
    }

    getParameters() {
        this.eventEmitter.emit('parameters', this.parameters);
    }

    // fonction inutile pour utiliser players
    getPlayer() {
        const rand = this.players[0];
        console.log(rand);
    }
}
