import { Tile } from '@app/services/game-context.service';
import { Player, PlayerId, State } from './room';

export type PlayerInfo = {
    info: Player;
    score: number;
    rackCount: number;
};

export class GameState {
    players: PlayerInfo[];
    reserveCount: number;
    board: Tile[][];
    turn: PlayerId;
    state: State;
    winner?: PlayerId;
}
