import { ALPHABET } from '@app/alphabet-template';
import { LetterPlacement, PlacementOption } from '@app/classes/placement-option';
import * as cst from '@app/constants';
import { Board } from './board';
import { Position } from './position';

export type Placement = {
    word: string;
    position: Position;
    horizontal: boolean;
    score: number;
    contact: boolean;
};

export class WordGetter {
    constructor(public board: Board) {}

    getWords(placement: PlacementOption): Placement[] {
        const words = placement.newLetters
            .map((newLetter) => this.getWord([newLetter], !placement.isHorizontal))
            .filter((letter) => letter) as Placement[];
        const firstWord = !this.board.get(new Position(cst.HALF_LENGTH, cst.HALF_LENGTH)).letter;
        const placeMiddle = placement.newLetters.some((letter) => letter.position.equals(new Position(cst.HALF_LENGTH, cst.HALF_LENGTH)));
        if (firstWord && !placeMiddle) throw new Error('Placement invalide: Le premier mot doit toucher le milieu du plateau');
        const mainWord = this.getWord(placement.newLetters, placement.isHorizontal);
        if (mainWord) words.push(mainWord);
        if (!firstWord && !words.some((word) => word.contact)) throw new Error('Placement invalide: Aucun point de contact');
        // TODO: What if mainWord undefined?
        return words;
    }

    findStartingOffset(position: Position, isHorizontal: boolean): number {
        if (!position.isInBound()) throw new Error('Initial position is out of bound');
        for (let offset = -1; ; offset--) {
            const newPos = position.withOffset(isHorizontal, offset);
            if (!newPos.isInBound() || !this.board.get(newPos).letter) return offset + 1;
        }
    }

    private getWord(newLetters: LetterPlacement[], isHorizontal: boolean): Placement | undefined {
        let offset = this.findStartingOffset(newLetters[0].position, isHorizontal);
        const startingPos = newLetters[0].position.withOffset(isHorizontal, offset);
        let idx = 0;
        let word = '';
        let wordScore = 0;
        let wordMultiplier = 1;
        let contact = false;
        for (; ; offset++) {
            const newPos = newLetters[0].position.withOffset(isHorizontal, offset);
            if (!newPos.isInBound()) break;
            const tile = this.board.get(newPos);
            if (!tile.letter) {
                if (idx >= newLetters.length) break;
                if (!newLetters[idx].position.equals(newPos)) throw new Error('End of word but still needs to place letters');
                const letter = newLetters[idx].letter;
                idx++;
                wordMultiplier *= tile.wordMultiplier;
                wordScore += tile.multiplier * ALPHABET[letter].score;
                word += letter;
            } else {
                word += tile.letter;
                wordScore += ALPHABET[tile.letter].score;
                contact = true;
            }
        }
        if (word.length < 2) return undefined;
        return { word, horizontal: isHorizontal, position: startingPos, score: wordScore * wordMultiplier, contact };
    }
}
