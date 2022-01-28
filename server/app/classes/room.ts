import { Parameters } from './parameters';

export type Player = { name: string; id: PlayerId };
export type EventHandler = (event: string, payload: unknown) => void;

export type RoomId = number;
export type PlayerId = string;

export class Room {
    readonly parameters: Parameters;
    readonly name: string;
    readonly id: RoomId;
    private mainPlayer: Player;
    private otherPlayer: Player | undefined;
    private eventHandler: EventHandler;

    constructor(id: RoomId, playerId: PlayerId, playerName: string, parameters: Parameters, eventHandler: EventHandler) {
        this.id = id;
        this.parameters = parameters;
        this.mainPlayer = {
            id: playerId,
            name: playerName,
        };
        this.name = `Partie de ${playerName}`;
        this.eventHandler = eventHandler;
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
        return undefined;
    }

    quit(playerId: PlayerId) {
        if (playerId === this.mainPlayer.id) {
            this.eventHandler('delete', null);
        } else if (this.otherPlayer && playerId === this.otherPlayer.id) {
            this.otherPlayer = undefined;
            this.eventHandler('left', null);
        }
    }

    kickOtherPlayer() {
        if (this.otherPlayer) {
            this.otherPlayer = undefined;
            this.eventHandler('kick', null);
        }
    }

    hasOtherPlayer(): boolean {
        return this.otherPlayer !== undefined;
    }
}
