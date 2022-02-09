import { alphabetTemplate } from "@app/alphabet-template";

export class GameTile{
    empty: boolean;
    private letter: string;
    private letterValue: number;
    public newlyPlaced: boolean;
    readonly multiplier: number;
    readonly wordMultiplier: number;

    constructor(multiplier: number, wordMultiplier?: number){
        this.empty = true;
        this.multiplier = multiplier;
        this.wordMultiplier = (wordMultiplier === undefined ? 1 : wordMultiplier);
    }

    setLetter(letter: string){
        if(letter.length === 1 && letter >= 'a' && letter <= 'z'){
            this.letter = letter;
            this.empty = false;
            this.newlyPlaced = true;
            this.letterValue = this.getLetterValue(this.letter);
        } else if(letter.length === 1 && letter >= 'A' && letter <= 'Z'){
            this.letter = letter.toLowerCase();
            this.empty = false;
            this.newlyPlaced = true;
            this.letterValue = 0;
        }
        return this.letterValue * this.multiplier;
    }

    getPoints(): number{
        if(this.letter !== undefined){
            if(this.newlyPlaced){
                return this.letterValue * this.multiplier;
            }
            return this.letterValue;
        }
        return -1;
    }

    getChar(): string{
        return this.empty ? '!' : this.letter;
    }

    private getLetterValue(char: string): number{
        for(let i=0; i < alphabetTemplate.length; i++){
            if(alphabetTemplate[i].name === char.toUpperCase()){
                return alphabetTemplate[i].score;
            }
        }
        return -1;
    }

}