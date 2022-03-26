import {
    NO_POINTS,
    OBJECTIVE_2_BIG_LETTERS,
    OBJECTIVE_3_VOWELS,
    OBJECTIVE_7_LETTERS_OR_MORE,
    OBJECTIVE_ALREADY_ON_BOARD,
    OBJECTIVE_ANAGRAM,
    OBJECTIVE_CORNER_PLACEMENT,
    OBJECTIVE_ONLY_VOWELS,
    OBJECTIVE_PALINDORME,
} from '@app/constants';
import { expect } from 'chai';
import {
    Objective,
    Objective2BigLetters,
    Objective3Vowels,
    Objective7LettersOrMore,
    ObjectiveAlreadyOnBoard,
    ObjectiveAnagram,
    ObjectiveCornerPlacement,
    ObjectiveOnlyVowels,
    ObjectivePalindrome,
} from './objective';
import { PlacementOption } from './placement-option';

/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('Objectives', () => {
    let placement: PlacementOption;
    let objective: Objective;

    beforeEach(() => {
        Objective.playedWords = new Set<string>();
    });

    it('should give points for a palindrome', () => {
        objective = new ObjectivePalindrome();

        placement = new PlacementOption(7, 7, true, 'laval');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_PALINDORME);

        placement = new PlacementOption(7, 7, true, 'elle');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_PALINDORME);

        placement = new PlacementOption(7, 7, true, 'ete');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_PALINDORME);
    });

    it('should not give points for no palindrome', () => {
        objective = new ObjectivePalindrome();

        placement = new PlacementOption(7, 7, true, 'lavel');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'aa');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'etre');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for a word already on board', () => {
        objective = new ObjectiveAlreadyOnBoard();
        const otherObjective = new ObjectivePalindrome();

        placement = new PlacementOption(3, 4, false, 'premiertest');
        objective.isObjectiveAccomplished(placement);
        placement = new PlacementOption(3, 4, false, 'secondtest');
        objective.isObjectiveAccomplished(placement);
        placement = new PlacementOption(3, 4, false, 'troisiemetest');
        otherObjective.isObjectiveAccomplished(placement);

        placement = new PlacementOption(7, 7, true, 'premiertest');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_ALREADY_ON_BOARD);

        placement = new PlacementOption(7, 7, true, 'secondtest');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_ALREADY_ON_BOARD);

        placement = new PlacementOption(7, 7, true, 'troisiemetest');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_ALREADY_ON_BOARD);
    });

    it('should not give points for not already on board', () => {
        objective = new ObjectiveAlreadyOnBoard();

        placement = new PlacementOption(7, 7, true, 'premiertest');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'secondtest');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'troisiemetest');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for a 3 or more vowels word', () => {
        objective = new Objective3Vowels();

        placement = new PlacementOption(7, 7, true, 'eau');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_3_VOWELS);

        placement = new PlacementOption(7, 7, true, 'automobile');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_3_VOWELS);

        placement = new PlacementOption(7, 7, true, 'auto');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_3_VOWELS);
    });

    it('should not give points for less than 3 vowels', () => {
        objective = new Objective3Vowels();

        placement = new PlacementOption(7, 7, true, 'laval');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'aa');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'etre');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for an anagram of a word already on board', () => {
        objective = new ObjectiveAnagram();
        const otherObjective = new ObjectivePalindrome();

        placement = new PlacementOption(3, 4, false, 'premiertest');
        objective.isObjectiveAccomplished(placement);
        placement = new PlacementOption(3, 4, false, 'secondtest');
        objective.isObjectiveAccomplished(placement);
        placement = new PlacementOption(3, 4, false, 'troisiemetest');
        otherObjective.isObjectiveAccomplished(placement);

        placement = new PlacementOption(7, 7, true, 'testpremier');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_ANAGRAM);

        placement = new PlacementOption(7, 7, true, 'tesecondst');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_ANAGRAM);

        placement = new PlacementOption(7, 7, true, 'testtroisieme');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_ANAGRAM);
    });

    it('should not give points for no anagram', () => {
        objective = new ObjectiveAnagram();
        placement = new PlacementOption(3, 4, false, 'premiertttt');
        objective.isObjectiveAccomplished(placement);

        placement = new PlacementOption(7, 7, true, 'premiertest');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'secondtest');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'troisiemetest');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for only placing vowels', () => {
        objective = new ObjectiveOnlyVowels();

        placement = new PlacementOption(7, 7, true, 'eau');
        let usedLetters = 'eau';
        let result = objective.isObjectiveAccomplished(placement, usedLetters);
        expect(result).to.equal(OBJECTIVE_ONLY_VOWELS);

        placement = new PlacementOption(7, 7, true, 'automobile');
        usedLetters = 'auoi';
        result = objective.isObjectiveAccomplished(placement, usedLetters);
        expect(result).to.equal(OBJECTIVE_ONLY_VOWELS);

        placement = new PlacementOption(7, 7, true, 'auto');
        usedLetters = 'o';
        result = objective.isObjectiveAccomplished(placement, usedLetters);
        expect(result).to.equal(OBJECTIVE_ONLY_VOWELS);
    });

    it('should not give points for placing not all vowels', () => {
        objective = new ObjectiveOnlyVowels();

        placement = new PlacementOption(7, 7, true, 'laval');
        let usedLetters = 'ava';
        let result = objective.isObjectiveAccomplished(placement, usedLetters);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'aas');
        usedLetters = 'aas';
        result = objective.isObjectiveAccomplished(placement, usedLetters);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'etre');
        usedLetters = 't';
        result = objective.isObjectiveAccomplished(placement, usedLetters);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for a word with 2 or more big letters', () => {
        objective = new Objective2BigLetters();

        placement = new PlacementOption(7, 7, true, 'kiwi');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_2_BIG_LETTERS);

        placement = new PlacementOption(7, 7, true, 'xqz');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_2_BIG_LETTERS);

        placement = new PlacementOption(7, 7, true, 'yak');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_2_BIG_LETTERS);
    });

    it('should not give points for less than 2 big letters', () => {
        objective = new Objective2BigLetters();

        placement = new PlacementOption(7, 7, true, 'premiertest');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'quoi');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'yeah');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for a word more than 7 letters', () => {
        objective = new Objective7LettersOrMore();

        placement = new PlacementOption(7, 7, true, 'premiertest');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_7_LETTERS_OR_MORE);

        placement = new PlacementOption(7, 7, true, 'collines');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_7_LETTERS_OR_MORE);

        placement = new PlacementOption(7, 7, true, 'anticonstitutionnellement');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_7_LETTERS_OR_MORE);
    });

    it('should not give points for words with 7 letters or less', () => {
        objective = new Objective7LettersOrMore();

        placement = new PlacementOption(7, 7, true, 'test');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'colline');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 7, true, 'justice');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for a word with a letter in the corner', () => {
        objective = new ObjectiveCornerPlacement();

        placement = new PlacementOption(0, 0, true, 'premiertest');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_CORNER_PLACEMENT);

        placement = new PlacementOption(0, 7, true, 'collines');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_CORNER_PLACEMENT);

        placement = new PlacementOption(14, 0, true, 'test');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_CORNER_PLACEMENT);

        placement = new PlacementOption(9, 14, false, 'droite');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_CORNER_PLACEMENT);

        placement = new PlacementOption(0, 14, false, 'coin');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(OBJECTIVE_CORNER_PLACEMENT);
    });

    it('should not give points for words with no letters in the corner', () => {
        objective = new ObjectiveCornerPlacement();

        placement = new PlacementOption(7, 7, true, 'test');
        let result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(0, 1, true, 'colline');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(0, 6, true, 'justice');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(13, 0, true, 'test');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(7, 14, false, 'droite');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(1, 14, false, 'coin');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(0, 13, false, 'cote');
        result = objective.isObjectiveAccomplished(placement);
        expect(result).to.equal(NO_POINTS);
    });
});
