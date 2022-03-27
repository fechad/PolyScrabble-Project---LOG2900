/* eslint-disable no-restricted-imports */
/* eslint-disable max-classes-per-file */
import * as cst from '../constants';
import { PlacementOption } from './placement-option';

export abstract class Objective {
    static playedWords: Set<string> = new Set<string>();
    protected points: number;
    protected isAvailable: boolean;

    getObjectivePoints(wordPlacement: PlacementOption, usedLetters?: string): number {
        if (!this.isAvailable) return cst.NO_POINTS;
        const accomplished = this.isObjectiveAccomplished(wordPlacement, usedLetters);
        Objective.playedWords.add(wordPlacement.word);
        if (accomplished) this.isAvailable = false;
        return accomplished ? this.points : cst.NO_POINTS;
    }
    protected abstract isObjectiveAccomplished(wordPlacement: PlacementOption, usedLetters?: string): boolean;
}

export class ObjectivePalindrome extends Objective {
    points = cst.OBJECTIVE_PALINDORME;
    isAvailable = true;

    isObjectiveAccomplished(wordPlacement: PlacementOption): boolean {
        if (wordPlacement.word.length < 3) return false;
        return [...wordPlacement.word].every((letter, i) => wordPlacement.word.charAt(wordPlacement.word.length - ++i) === letter);
    }
}

export class ObjectiveAlreadyOnBoard extends Objective {
    points = cst.OBJECTIVE_ALREADY_ON_BOARD;
    isAvailable = true;

    isObjectiveAccomplished(wordPlacement: PlacementOption): boolean {
        return Objective.playedWords.has(wordPlacement.word);
    }
}

export class Objective3Vowels extends Objective {
    points = cst.OBJECTIVE_3_VOWELS;
    isAvailable = true;

    isObjectiveAccomplished(wordPlacement: PlacementOption): boolean {
        let vowelCount = 0;
        [...wordPlacement.word].forEach((letter) => {
            if (cst.VOWELS.has(letter)) vowelCount++;
        });
        return vowelCount >= 3;
    }
}

export class ObjectiveAnagram extends Objective {
    points = cst.OBJECTIVE_ANAGRAM;
    isAvailable = true;

    isObjectiveAccomplished(wordPlacement: PlacementOption): boolean {
        return [...Objective.playedWords].some((playedWord) => this.isAnagram(wordPlacement.word, playedWord));
    }

    private isAnagram(triedWord: string, word2: string): boolean {
        let containsLetters = true;
        [...triedWord].forEach((letter) => {
            if (word2.includes(letter)) word2 = word2.replace(letter, '');
            else containsLetters = false;
        });
        return containsLetters && word2.length === 0;
    }
}

export class ObjectiveOnlyVowels extends Objective {
    points = cst.OBJECTIVE_ONLY_VOWELS;
    isAvailable = true;

    isObjectiveAccomplished(wordPlacement: PlacementOption, usedLetters: string): boolean {
        return [...usedLetters].every((letter) => cst.VOWELS.has(letter));
    }
}

export class Objective2BigLetters extends Objective {
    points = cst.OBJECTIVE_2_BIG_LETTERS;
    isAvailable = true;

    isObjectiveAccomplished(wordPlacement: PlacementOption): boolean {
        let count = 0;
        [...wordPlacement.word].filter((letter) => cst.BIG_POINTS.has(letter)).forEach(() => count++);
        return count >= 2;
    }
}

export class Objective7LettersOrMore extends Objective {
    points = cst.OBJECTIVE_7_LETTERS_OR_MORE;
    isAvailable = true;

    isObjectiveAccomplished(wordPlacement: PlacementOption): boolean {
        return wordPlacement.word.length > cst.OBJECTIVE_NUMBER_OF_LETTER;
    }
}

// TODO mettre les corner placement dans une structure de donnee
export class ObjectiveCornerPlacement extends Objective {
    points = cst.OBJECTIVE_CORNER_PLACEMENT;
    isAvailable = true;

    isObjectiveAccomplished(wordPlacement: PlacementOption): boolean {
        if (wordPlacement.row === 0 && wordPlacement.col === 0) return true;
        if (wordPlacement.isHorizontal && (wordPlacement.row === 0 || wordPlacement.row === cst.BOARD_LENGTH - 1)) {
            if (wordPlacement.col + wordPlacement.word.length === cst.BOARD_LENGTH || wordPlacement.col === 0) return true;
        }
        if (!wordPlacement.isHorizontal && (wordPlacement.col === 0 || wordPlacement.col === cst.BOARD_LENGTH - 1)) {
            if (wordPlacement.row + wordPlacement.word.length === cst.BOARD_LENGTH || wordPlacement.row === 0) return true;
        }
        return false;
    }
}
