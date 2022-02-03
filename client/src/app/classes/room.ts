import { Parameters } from './parameters';

export type RoomId = number;
export type PlayerId = string;
export type Player = { name: string; id: PlayerId };

export class Room {
    readonly parameters: Parameters;
    readonly name: string;
    readonly id: RoomId;
    readonly mainPlayer: Player;
    readonly otherPlayer: Player | undefined;
}
