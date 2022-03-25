/* eslint-disable no-restricted-imports */
/* eslint-disable max-classes-per-file */
import * as cst from '../constants';
import { PlacementOption } from './placement-option';

export abstract class Objective {
    static playedWords: Set<string> = new Set<string>();
    readonly points: number;
    abstract isObjectiveAccomplished(wordPlacement: PlacementOption, usedLetters?: string): number;
}

export class ObjectivePalindrome extends Objective {
    points = cst.OBJECTIVE_PALINDORME;

    isObjectiveAccomplished(wordPlacement: PlacementOption): number {
        const word = wordPlacement.word;
        Objective.playedWords.add(word);
        if (word.length < 3) return cst.NO_POINTS;
        for (let i = 0; i <= word.length / 2; i++) if (word.charAt(i) !== word.charAt(word.length - 1 - i)) return cst.NO_POINTS;
        return this.points;
    }
}

export class ObjectiveAlreadyOnBoard extends Objective {
    points = cst.OBJECTIVE_ALREADY_ON_BOARD;

    isObjectiveAccomplished(wordPlacement: PlacementOption): number {
        if (Objective.playedWords.has(wordPlacement.word)) return this.points;
        Objective.playedWords.add(wordPlacement.word);
        return cst.NO_POINTS;
    }
}

export class Objective3Vowels extends Objective {
    points = cst.OBJECTIVE_3_VOWELS;

    isObjectiveAccomplished(wordPlacement: PlacementOption): number {
        let vowelCount = 0;
        Objective.playedWords.add(wordPlacement.word);
        for (const letter of wordPlacement.word) if (cst.VOWELS.has(letter)) vowelCount++;
        return vowelCount >= 3 ? this.points : cst.NO_POINTS;
    }
}

export class ObjectiveAnagram extends Objective {
    points = cst.OBJECTIVE_ANAGRAM;

    isObjectiveAccomplished(wordPlacement: PlacementOption): number {
        for (const alreadyPlayed of Objective.playedWords) if (this.isAnagram(wordPlacement.word, alreadyPlayed)) return this.points;
        Objective.playedWords.add(wordPlacement.word);
        return cst.NO_POINTS;
    }

    isAnagram(triedWord: string, word2: string): boolean {
        if (triedWord.length !== word2.length) return false;
        if ([...triedWord].some((letter) => !word2.includes(letter))) return false;
        return true;
    }
}

export class ObjectiveOnlyVowels extends Objective {
    points = cst.OBJECTIVE_ONLY_VOWELS;

    isObjectiveAccomplished(wordPlacement: PlacementOption, usedLetters: string): number {
        Objective.playedWords.add(wordPlacement.word);
        if ([...usedLetters].some((letter) => !cst.VOWELS.has(letter))) return cst.NO_POINTS;
        return this.points;
    }
}

export class Objective2BigLetters extends Objective {
    points = cst.OBJECTIVE_2_BIG_LETTERS;

    isObjectiveAccomplished(wordPlacement: PlacementOption): number {
        let count = 0;
        Objective.playedWords.add(wordPlacement.word);
        [...wordPlacement.word].forEach((letter) => {
            if (cst.BIG_POINTS.has(letter)) count++;
        });
        return count >= 2 ? this.points : cst.NO_POINTS;
    }
}

export class Objective7LettersOrMore extends Objective {
    points = cst.OBJECTIVE_7_LETTERS_OR_MORE;

    isObjectiveAccomplished(wordPlacement: PlacementOption): number {
        Objective.playedWords.add(wordPlacement.word);
        return wordPlacement.word.length > cst.OBJECTIVE_NUMBER_OF_LETTER ? this.points : cst.NO_POINTS;
    }
}

export class ObjectiveCornerPlacement extends Objective {
    points = cst.OBJECTIVE_CORNER_PLACEMENT;

    isObjectiveAccomplished(wordPlacement: PlacementOption): number {
        Objective.playedWords.add(wordPlacement.word);
        if (wordPlacement.row === 0 && wordPlacement.col === 0) return this.points;
        if (wordPlacement.isHorizontal && (wordPlacement.row === 0 || wordPlacement.row === cst.BOARD_LENGTH - 1)) {
            if (wordPlacement.col + wordPlacement.word.length === cst.BOARD_LENGTH || wordPlacement.col === 0) return this.points;
        }
        if (!wordPlacement.isHorizontal && (wordPlacement.col === 0 || wordPlacement.col === cst.BOARD_LENGTH - 1)) {
            if (wordPlacement.row + wordPlacement.word.length === cst.BOARD_LENGTH || wordPlacement.row === 0) return this.points;
        }
        return cst.NO_POINTS;
    }
}
