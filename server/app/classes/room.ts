import { EventEmitter } from 'events';
import { GameType, Parameters } from './parameters';

export type Player = { avatar: string; name: string; id: PlayerId; connected: boolean; virtual: boolean };

export type RoomId = number;
export type PlayerId = string;

export enum State {
    Setup,
    Started,
    Ended,
    Aborted,
}

export class Room extends EventEmitter {
    readonly name: string;
    readonly mainPlayer: Player;
    private otherPlayer: Player | undefined;
    private state: State = State.Setup;

    constructor(readonly id: RoomId, playerId: PlayerId, playerName: string, readonly parameters: Parameters) {
        super();

        this.mainPlayer = {
            id: playerId,
            name: playerName,
            connected: true,
            virtual: false,
            avatar: parameters.avatar,
        };
        this.name = `Partie de ${playerName}`;
    }

    needsOtherPlayer(): boolean {
        return (
            this.otherPlayer === undefined &&
            this.parameters.gameType === GameType.Multiplayer &&
            this.mainPlayer.connected &&
            this.state === State.Setup
        );
    }

    addPlayer(playerId: PlayerId, playerName: string, virtual: boolean, avatar: string): Error | undefined {
        if (playerName === this.mainPlayer.name) {
            return Error('Ce nom a déjà été pris');
        }
        if (playerId === this.mainPlayer.id) {
            return Error("Impossible d'avoir le même identifiant pour les deux joueurs");
        }
        if (this.otherPlayer) {
            return Error('Il y a déjà deux joueurs dans cette partie');
        }
        this.otherPlayer = { id: playerId, avatar, name: playerName, connected: true, virtual };
        this.emit('update-room');
        return undefined;
    }

    quit(mainPlayer: boolean) {
        if (mainPlayer && this.state === State.Setup) {
            this.mainPlayer.connected = false;
            this.emit('kick');
        } else if (this.state === State.Setup) {
            this.otherPlayer = undefined;
        } else if (mainPlayer) {
            this.mainPlayer.connected = false;
        } else if (this.otherPlayer) {
            this.otherPlayer.connected = false;
        }
        this.emit('update-room');
    }

    start() {
        if (!this.needsOtherPlayer() && this.state === State.Setup) {
            this.state = State.Started;
            this.emit('update-room');
        }
    }

    end(forfeit: boolean) {
        if (this.state === State.Started) {
            this.state = forfeit ? State.Aborted : State.Ended;
            this.emit('update-room');
        }
    }

    kickOtherPlayer() {
        if (this.otherPlayer && this.state === State.Setup) {
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

    getState(): State {
        return this.state;
    }
}
