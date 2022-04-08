/* Copy from server */

type Timer = number;
type IdDictionnary = number;

export enum GameType {
    Solo,
    Multiplayer,
}
export enum Difficulty {
    Beginner,
    Expert,
}

export const DEFAULT_TIMER = 60;

export class Parameters {
    avatar: string;
    timer: Timer = DEFAULT_TIMER;
    dictionnary: IdDictionnary = 0;
    gameType: GameType = GameType.Multiplayer;
    difficulty?: Difficulty;
    log2990: boolean;
}
