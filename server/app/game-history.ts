export type PlayerGameInfo = { name: string; pointsScored: number };
export enum GameMode {
    Classic = 'Classique',
    Log2990 = 'LOG2990',
}
export interface GameHistory {
    startTime: Date;
    endTime: Date;
    length: number;
    firstPlayer: PlayerGameInfo;
    secondPlayer: PlayerGameInfo;
    mode: GameMode;
}
