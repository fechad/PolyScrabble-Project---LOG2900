export type PlayerGameInfo = { name: string; pointsScored: number | undefined };
export enum GameMode {
    Classic = 'Classique',
    Log2990 = 'LOG2990',
}
export interface GameHistory {
    startTime: Date;
    endTime: Date | undefined;
    length: number | undefined;
    firstPlayer: PlayerGameInfo;
    secondPlayer: PlayerGameInfo;
    mode: GameMode;
}
