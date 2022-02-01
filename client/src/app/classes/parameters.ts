
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
    timer: Timer = DEFAULT_TIMER;
    dictionnary: IdDictionnary = 0;
    gameType: GameType = GameType.Multiplayer;
    difficulty?: Difficulty;

    validateParameters(): Error | undefined {
        // TODO: check if dictionnary ID is in the list
        const MIN_DIVISION = 30;
        const MAX_TIME = 600;

        if (this.timer <= 0 || this.timer % MIN_DIVISION !== 0 || this.timer > MAX_TIME) {
            return Error('Timer should be divisible by 30 and be between 0 and 600');
        }
        if (this.gameType === GameType.Solo && this.difficulty === undefined) {
            return Error('Difficulty is needed for Solo mode');
        }
        return;
    }
}
