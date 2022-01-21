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

type Error = string | undefined;

export class Parameters {
    timer: Timer = 30;
    dictionnary: IdDictionnary = 0;
    gameType: GameType = GameType.Multiplayer;
    difficulty?: Difficulty;

    constructor() {}

    parseChange(input: string): Error {
        for(const change in input.split(' ')) {
            const [param, _value] = change.split(':');
            switch (param) {
                case 'timer':
                    break;
                case 'dictionnary':
                    break;
                case 'gameType':
                    break;
                case 'difficulty':
                    break;
                default:
                    return 'You suck';
            }
        }
        return;
    }
}