/* eslint-disable no-restricted-imports */
/* eslint-disable max-classes-per-file */
import * as constants from '../constants';
import { PlacementOption } from './placement-option';

export abstract class Objective {
    readonly points: number;
    readonly description: string;
    constructor(protected playedWords: Set<string>) {}

    isAccomplished(wordPlacement: PlacementOption, newWords: string[]): boolean {
        const accomplished = this.isObjectiveAccomplished(wordPlacement, newWords);
        return accomplished;
    }

    protected abstract isObjectiveAccomplished(wordPlacement: PlacementOption, newWords: string[]): boolean;
}

export abstract class ObjectivePlacement extends Objective {
    isObjectiveAccomplished(wordPlacement: PlacementOption, _newWords: string[]): boolean {
        return this.isObjectiveAccomplishedPlacement(wordPlacement);
    }
    protected abstract isObjectiveAccomplishedPlacement(wordPlacement: PlacementOption): boolean;
}

export abstract class ObjectiveFormed extends Objective {
    isObjectiveAccomplished(_wordPlacement: PlacementOption, newWords: string[]): boolean {
        return newWords.some((word) => this.isObjectiveAccomplishedFormed(word));
    }
    protected abstract isObjectiveAccomplishedFormed(word: string): boolean;
}

export class ObjectivePalindrome extends ObjectiveFormed {
    points = constants.OBJECTIVE_PALINDORME;
    description = 'Former un palindrome';

    isObjectiveAccomplishedFormed(word: string): boolean {
        if (word.length < 3) return false;
        return [...word].every((letter, i) => word[word.length - (i + 1)] === letter);
    }
}

export class ObjectiveAlreadyOnBoard extends ObjectiveFormed {
    points = constants.OBJECTIVE_ALREADY_ON_BOARD;
    description = 'Former un mot déjà présent sur le plateau';

    isObjectiveAccomplishedFormed(word: string): boolean {
        return this.playedWords.has(word);
    }
}

export class Objective3Vowels extends ObjectiveFormed {
    points = constants.OBJECTIVE_3_VOWELS;
    description = 'Former un mot avec 3 voyelles';

    isObjectiveAccomplishedFormed(word: string): boolean {
        const vowelCount = [...word].filter((letter) => constants.VOWELS.has(letter)).length;
        return vowelCount >= 3;
    }
}

export class ObjectiveAnagram extends ObjectiveFormed {
    points = constants.OBJECTIVE_ANAGRAM;
    description = "Former un anagramme d'un mot déja présent";

    isObjectiveAccomplishedFormed(word: string): boolean {
        return [...this.playedWords].some((playedWord) => this.isAnagram(word, playedWord) && word !== playedWord);
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
    points = constants.OBJECTIVE_ONLY_VOWELS;
    description = 'Former un mot sans ajouter de consonne';

    isObjectiveAccomplishedPlacement(wordPlacement: PlacementOption): boolean {
        return wordPlacement.newLetters.every((letter) => constants.VOWELS.has(letter.letter.toLowerCase()));
    }
}

export class Objective2BigLetters extends ObjectiveFormed {
    points = constants.OBJECTIVE_2_BIG_LETTERS;
    description = 'Former un mot avec 2 lettres de plus de 5 points';

    isObjectiveAccomplishedFormed(word: string): boolean {
        const count = [...word].filter((letter) => constants.BIG_POINTS.has(letter)).length;
        return count >= 2;
    }
}

export class Objective7LettersOrMore extends ObjectiveFormed {
    points = constants.OBJECTIVE_7_LETTERS_OR_MORE;
    description = 'Former un mot de plus de 7 lettres';

    isObjectiveAccomplishedFormed(word: string): boolean {
        return word.length > constants.OBJECTIVE_NUMBER_OF_LETTER;
    }
}

export class ObjectiveCornerPlacement extends ObjectivePlacement {
    points = constants.OBJECTIVE_CORNER_PLACEMENT;
    description = 'Placer une lettre dans un coin';

    isObjectiveAccomplishedPlacement(wordPlacement: PlacementOption): boolean {
        return wordPlacement.newLetters.some(
            (letter) =>
                (letter.position.row === 0 || letter.position.row === constants.BOARD_LENGTH - 1) &&
                (letter.position.col === 0 || letter.position.col === constants.BOARD_LENGTH - 1),
        );
    }
}

export const OBJECTIVE_TYPES: (typeof ObjectivePalindrome | typeof ObjectiveOnlyVowels)[] = [
    ObjectivePalindrome,
    ObjectiveAlreadyOnBoard,
    Objective3Vowels,
    ObjectiveAnagram,
    ObjectiveOnlyVowels,
    Objective2BigLetters,
    Objective7LettersOrMore,
    ObjectiveCornerPlacement,
];
