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
        console.log('game Instance!');
        this.gameId = id;
        this.parameters = parameters;
        this.players = players;
    }

    message(message: Message) {
        this.messages.push(message);
        this.eventEmitter.emit('message', message);
    }

    placeLetters(letters: string, position: string, playerId: PlayerId) {
<<<<<<< HEAD
        if (this.checkTurn(playerId, false)) {
=======
        if (this.checkTurn(playerId)) {
>>>>>>> dev
            // TODO: make verifications (probably return game-error)
            // TODO: calculate points
            // TODO: emit the result
            const points = 26;
            this.eventEmitter.emit('placed', letters, position, points, playerId);
        }
    }

    changeLetters(letters: string, playerId: PlayerId) {
<<<<<<< HEAD
        if (this.checkTurn(playerId, false)) {
=======
        if (this.checkTurn(playerId)) {
>>>>>>> dev
            // TODO: change the letters in the service
            // TODO: emit the new rack
            this.eventEmitter.emit('rack', letters, playerId);
        }
    }

    getParameters() {
        this.eventEmitter.emit('parameters', this.parameters);
    }

<<<<<<< HEAD
    skipTurn(playerId: PlayerId, timerRequest: boolean) {
        if (this.checkTurn(playerId, timerRequest)) {
            this.isPlayer0Turn = !this.isPlayer0Turn;
            console.log('emmiting turn');
=======
    skipTurn(playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            this.isPlayer0Turn = !this.isPlayer0Turn;
>>>>>>> dev
            this.eventEmitter.emit('turn', this.isPlayer0Turn);
        }
    }

<<<<<<< HEAD
    private checkTurn(playerId: PlayerId, timerRequest: boolean) {
        const validTurn = playerId === (this.isPlayer0Turn ? this.players[0].id : this.players[1].id);
        if (!validTurn && timerRequest === false) {
            this.eventEmitter.emit('game-error', new Error("Ce n'est pas votre tour"));
        } else if (!validTurn && timerRequest === true) {
            console.log('invalid timer try');
            return false;
=======
    private checkTurn(playerId: PlayerId) {
        const validTurn = playerId === (this.isPlayer0Turn ? this.players[0].id : this.players[1].id);
        if (!validTurn) {
            this.eventEmitter.emit('game-error', new Error("Ce n'est pas votre tour"));
>>>>>>> dev
        }
        return validTurn;
    }
}
