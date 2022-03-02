import { EventEmitter } from 'events';
import { Parameters } from './parameters';

export type Player = { name: string; id: PlayerId; connected: boolean; virtual: boolean };

export type RoomId = number;
export type PlayerId = string;

export class Room extends EventEmitter {
    readonly parameters: Parameters;
    readonly name: string;
    readonly id: RoomId;
    readonly mainPlayer: Player;
    private otherPlayer: Player | undefined;
    private started: boolean = false;

    constructor(id: RoomId, playerId: PlayerId, playerName: string, parameters: Parameters) {
        super();

        this.id = id;
        this.parameters = parameters;
        this.mainPlayer = {
            id: playerId,
            name: playerName,
            connected: true,
            virtual: false,
        };
        this.name = `Partie de ${playerName}`;
    }

    addPlayer(playerId: PlayerId, playerName: string, virtual: boolean): Error | undefined {
        if (playerName === this.mainPlayer.name) {
            return Error('Ce nom a déjà été prit');
        }
        if (playerId === this.mainPlayer.id) {
            return Error("Impossible d'avoir le même identifiant pour les deux joueurs");
        }
        if (this.otherPlayer !== undefined) {
            return Error('Il y a déjà deux joueurs dans cette partie');
        }
        this.otherPlayer = { id: playerId, name: playerName, connected: true, virtual };
        this.emit('update-room');
        return undefined;
    }

    quit(mainPlayer: boolean) {
        if (mainPlayer && !this.started) {
            this.emit('kick');
        } else if (!this.started) {
            this.otherPlayer = undefined;
        } else if (mainPlayer) {
            this.mainPlayer.connected = false;
        } else if (this.otherPlayer) {
            this.otherPlayer.connected = false;
        }
        this.emit('update-room');
    }

    start() {
        if (this.otherPlayer && !this.started) {
            this.started = true;
            this.emit('update-room');
        }
    }

    kickOtherPlayer() {
        if (this.otherPlayer && !this.started) {
            console.log(`Kicked player from room ${this.id}`);
            this.otherPlayer = undefined;
            this.emit('kick');
            this.emit('update-room');
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
