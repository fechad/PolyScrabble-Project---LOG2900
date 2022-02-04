import { EventEmitter } from 'events';
import { Parameters } from './parameters';

export type Player = { name: string; id: PlayerId };

export type RoomId = number;
export type PlayerId = string;

export class Room {
    readonly events: EventEmitter = new EventEmitter();

    readonly parameters: Parameters;
    readonly name: string;
    readonly id: RoomId;
    readonly mainPlayer: Player;
    private otherPlayer: Player | undefined;
    private started: boolean = false;

    constructor(id: RoomId, playerId: PlayerId, playerName: string, parameters: Parameters) {
        this.id = id;
        this.parameters = parameters;
        this.mainPlayer = {
            id: playerId,
            name: playerName,
        };
        this.name = `Partie de ${playerName}`;
    }

    addPlayer(playerId: PlayerId, playerName: string): Error | undefined {
        if (playerName === this.mainPlayer.name) {
            return Error('this name is already taken');
        }
        if (playerId === this.mainPlayer.id) {
            return Error('Cannot have same id for both players');
        }
        if (this.otherPlayer !== undefined) {
            return Error('already 2 players in the game');
        }
        this.otherPlayer = { id: playerId, name: playerName };
        this.events.emit('updateRoom');
        return undefined;
    }

    quit(mainPlayer: boolean) {
        if (mainPlayer) {
            this.events.emit('kick');
        } else {
            this.otherPlayer = undefined;
            this.events.emit('updateRoom');
        }
    }

    start() {
        if (this.otherPlayer && !this.started) {
            this.started = true;
            this.events.emit('updateRoom');
        }
    }

    kickOtherPlayer() {
        if (this.otherPlayer && !this.started) {
            console.log(`Kicked player from room ${this.id}`);
            this.otherPlayer = undefined;
            this.events.emit('kick');
            this.events.emit('updateRoom');
        }
    }

    hasOtherPlayer(): boolean {
        return this.otherPlayer !== undefined;
    }

    getOtherPlayer(): Player | undefined {
        return this.otherPlayer;
    }

    isStarted(): boolean {
        return this.started;
    }
}
