import { alphabetTemplate } from '@app/alphabet-template';
import { Letter } from '@app/letter';

const INVALID = -1;

export class GameTile {
    empty: boolean;
    newlyPlaced: boolean;
    letter: Letter;
    readonly multiplier: number;
    readonly wordMultiplier: number;

    constructor(multiplier: number, wordMultiplier?: number) {
        this.empty = true;
        this.multiplier = multiplier;
        this.wordMultiplier = wordMultiplier === undefined ? 1 : wordMultiplier;
    }

    setLetter(letter: string) {
        this.empty = false;
        this.newlyPlaced = true;
        this.letter = this.getLetter(letter);
        if (letter.length === 1 && letter >= 'A' && letter <= 'Z') {
            // this is considered a * letter
            this.letter.score = 0;
        }
    }

    deleteLetter() {
        this.empty = true;
        this.newlyPlaced = true;
    }

    getPoints(): number {
        if (this.letter === undefined || this.empty) return INVALID;
        return this.letter.score * (this.newlyPlaced ? this.multiplier : 1);
    }

    getChar(): string {
        return this.empty ? '!' : this.letter.name.toLowerCase();
    }

    private getLetter(char: string): Letter {
        for (const letter of alphabetTemplate) {
            if (letter.name === char.toUpperCase()) {
                return Object.assign({}, letter);
            }
        }
        return alphabetTemplate[alphabetTemplate.length - 1];
    }
}
