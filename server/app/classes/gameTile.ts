import { alphabetTemplate } from '@app/alphabet-template';

const INVALID = -1;

export class GameTile {
    empty: boolean;
    newlyPlaced: boolean;
    readonly multiplier: number;
    readonly wordMultiplier: number;
    private letter: string;
    private letterValue: number;

    constructor(multiplier: number, wordMultiplier?: number) {
        this.empty = true;
        this.multiplier = multiplier;
        this.wordMultiplier = wordMultiplier === undefined ? 1 : wordMultiplier;
    }

    setLetter(letter: string) {
        if (letter.length === 1 && letter >= 'a' && letter <= 'z') {
            this.letter = letter;
            this.empty = false;
            this.newlyPlaced = true;
            this.letterValue = this.getLetterValue(this.letter);
        } else if (letter.length === 1 && letter >= 'A' && letter <= 'Z') {
            this.letter = letter.toLowerCase();
            this.empty = false;
            this.newlyPlaced = true;
            this.letterValue = 0;
        }
        return this.letterValue * this.multiplier;
    }

    getPoints(): number {
        if (this.letter !== undefined) {
            if (this.newlyPlaced) {
                return this.letterValue * this.multiplier;
            }
            return this.letterValue;
        }
        return INVALID;
    }

    getChar(): string {
        return this.empty ? '!' : this.letter;
    }

    private getLetterValue(char: string): number {
        for (const letter of alphabetTemplate) {
            if (letter.name === char.toUpperCase()) {
                return letter.score;
            }
        }
        return INVALID;
    }
}
