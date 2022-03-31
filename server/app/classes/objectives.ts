/* eslint-disable no-restricted-imports */
/* eslint-disable max-classes-per-file */
import * as cst from '../constants';
import { PlacementOption } from './placement-option';

export abstract class Objective {
    static playedWords: Set<string> = new Set<string>();
    protected points: number;
    protected isAvailable: boolean = true;

    getObjectivePoints(wordPlacement: PlacementOption, newWords: string[]): number {
        if (!this.isAvailable) return cst.NO_POINTS;
        const accomplished = this.isObjectiveAccomplished(wordPlacement, newWords);
        for (const newWord of newWords) Objective.playedWords.add(newWord);
        if (accomplished) this.isAvailable = false;
        return accomplished ? this.points : cst.NO_POINTS;
    }
    protected abstract isObjectiveAccomplished(wordPlacement: PlacementOption, newWords: string[]): boolean;
}

export abstract class ObjectivePlacement {
    isObjectiveAccomplished(wordPlacement: PlacementOption, _newWords: string[]): boolean {
        return this.isObjectiveAccomplishedPlacement(wordPlacement);
    }
    protected abstract isObjectiveAccomplishedPlacement(wordPlacement: PlacementOption): boolean;
}

export abstract class ObjectiveFormed {
    isObjectiveAccomplished(_wordPlacement: PlacementOption, newWords: string[]): boolean {
        return newWords.some((word) => this.isObjectiveAccomplishedFormed(word));
    }
    protected abstract isObjectiveAccomplishedFormed(word: string): boolean;
}

export class ObjectivePalindrome extends ObjectiveFormed {
    points = cst.OBJECTIVE_PALINDORME;

    isObjectiveAccomplishedFormed(word: string): boolean {
        if (word.length < 3) return false;
        return [...word].every((letter, i) => word[word.length - (i + 1)] === letter);
    }
}

export class ObjectiveAlreadyOnBoard extends ObjectiveFormed {
    points = cst.OBJECTIVE_ALREADY_ON_BOARD;

    isObjectiveAccomplishedFormed(word: string): boolean {
        return Objective.playedWords.has(word);
    }
}

export class Objective3Vowels extends ObjectiveFormed {
    points = cst.OBJECTIVE_3_VOWELS;

    isObjectiveAccomplishedFormed(word: string): boolean {
        const vowelCount = [...word].filter((letter) => cst.VOWELS.has(letter)).length;
        return vowelCount >= 3;
    }
}

export class ObjectiveAnagram extends ObjectiveFormed {
    points = cst.OBJECTIVE_ANAGRAM;

    isObjectiveAccomplishedFormed(word: string): boolean {
        return [...Objective.playedWords].some((playedWord) => this.isAnagram(word, playedWord));
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

export class ObjectiveOnlyVowels extends ObjectivePlacement {
    points = cst.OBJECTIVE_ONLY_VOWELS;

    isObjectiveAccomplishedPlacement(wordPlacement: PlacementOption): boolean {
        return wordPlacement.newLetters.every((letter) => cst.VOWELS.has(letter.letter));
    }
}

export class Objective2BigLetters extends ObjectiveFormed {
    points = cst.OBJECTIVE_2_BIG_LETTERS;

    isObjectiveAccomplishedFormed(word: string): boolean {
        const count = [...word].filter((letter) => cst.BIG_POINTS.has(letter)).length;
        return count >= 2;
    }
}

export class Objective7LettersOrMore extends ObjectiveFormed {
    points = cst.OBJECTIVE_7_LETTERS_OR_MORE;

    isObjectiveAccomplishedFormed(word: string): boolean {
        return word.length > cst.OBJECTIVE_NUMBER_OF_LETTER;
    }
}

export class ObjectiveCornerPlacement extends ObjectivePlacement {
    points = cst.OBJECTIVE_CORNER_PLACEMENT;

    isObjectiveAccomplishedPlacement(wordPlacement: PlacementOption): boolean {
        return wordPlacement.newLetters.some(
            (letter) =>
                (letter.position.row === 0 || letter.position.row === cst.BOARD_LENGTH - 1) &&
                (letter.position.col === 0 || letter.position.col === cst.BOARD_LENGTH - 1),
        );
    }
}
