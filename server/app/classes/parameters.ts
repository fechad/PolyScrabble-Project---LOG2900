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


export class Parameters {
    public timer: Timer = 30;
    public dictionnary: IdDictionnary = 0;
    public gameType: GameType = GameType.Multiplayer;
    public difficulty?: Difficulty;

    constructor() {}


    validateParameters(): Error | undefined {
        //TODO: check if dictionnary ID is in the list
        
        if(this.timer <= 0 || this.timer % 30 != 0 || this.timer > 600){
            return Error('Timer should be divisible by 30 and be between 0 and 600');
        }
        if(this.gameType == GameType.Solo && this.difficulty === undefined){
            return Error('Difficulty is needed for Solo mode');
        }
        return;
    }
}