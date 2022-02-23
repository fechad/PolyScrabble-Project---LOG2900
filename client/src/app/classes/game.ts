import { Tile } from "@app/services/game-context.service";
import { Player, PlayerId } from "./room";

export type PlayerInfo = {
    info: Player;
    score: number;
    rackCount: number;
};

export type GameState = {
    players: PlayerInfo[];
    reserveCount: number;
    board: Tile[][];
    turn: PlayerId;
    ended: boolean;
    winner?: PlayerId;
    summary?: string;
};