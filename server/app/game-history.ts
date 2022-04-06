export type PlayerGameInfo = { name: string; pointsScored: number | undefined };
export enum GameMode {
    Classic = 'Classique',
    Log2990 = 'LOG2990',
}
export interface GameHistory {
    startTime: string;
    length: string | undefined;
    firstPlayer: PlayerGameInfo;
    secondPlayer: PlayerGameInfo;
    mode: GameMode;
}
