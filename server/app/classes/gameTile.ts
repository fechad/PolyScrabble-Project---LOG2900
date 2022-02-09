export class GameTile{
    empty: boolean;
    private letter: string;
    private letterValue: number;
    readonly multiplier: number;
    readonly wordMultiplier: number;

    constructor(multiplier: number, wordMultiplier?: number){
        this.empty = true;
        this.multiplier = multiplier;
        this.wordMultiplier = (wordMultiplier === undefined ? 1 : wordMultiplier);
    }

    setLetter(letter: string): number{
        if(letter.length === 1 && letter >= 'a' && letter <= 'z'){
            this.letter = letter;
            this.empty = false;
            this.letterValue = 1;
            //TODO: get letter score for letterValue
        } else if(letter.length === 1 && letter >= 'A' && letter <= 'Z'){
            this.letter = letter.toLowerCase();
            this.empty = false;
            this.letterValue = 0;
        }
        return this.letterValue * this.multiplier;
    }

    getPoints(): number{
        if(this.letter !== undefined){
            return this.letterValue;
        }
        return -1;
    }

    getChar(): string{
        return this.empty ? '!' : this.letter;
    }

}