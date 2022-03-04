/* Copy from server */

type Timer = number;
type IdDictionnary = number;

export enum GameType {
    Solo,
    Multiplayer,
}
export enum Difficulty {
    Beginner = 'debutant',
    Expert = 'expert',
}
export const difficulties = [
    {
        id: 0,
        name: 'débutant',
    },
    {
        id: 1,
        name: 'expert',
    },
];

export const DEFAULT_TIMER = 60;

export class Parameters {
    timer: Timer = DEFAULT_TIMER;
    dictionnary: IdDictionnary = 0;
    gameType: GameType = GameType.Multiplayer;
    difficulty?: Difficulty;
}
