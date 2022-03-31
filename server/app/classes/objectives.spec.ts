import {
    NO_POINTS, OBJECTIVE_2_BIG_LETTERS, OBJECTIVE_3_VOWELS, OBJECTIVE_7_LETTERS_OR_MORE, OBJECTIVE_ALREADY_ON_BOARD, OBJECTIVE_ANAGRAM, OBJECTIVE_CORNER_PLACEMENT, OBJECTIVE_ONLY_VOWELS, OBJECTIVE_PALINDORME
} from '@app/constants';
import { assert, expect } from 'chai';
import {
    Objective, Objective2BigLetters, Objective3Vowels, Objective7LettersOrMore, ObjectiveAlreadyOnBoard, ObjectiveAnagram, ObjectiveCornerPlacement, ObjectiveOnlyVowels, ObjectivePalindrome
} from './objectives';
import { PlacementOption } from './placement-option';
import { Position } from './position';

/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */

describe('Objectives', () => {
    let placement: PlacementOption;
    let objective: Objective;

    beforeEach(() => {
        Objective.playedWords = new Set<string>();
        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(7, 7) },
            { letter: 'e', position: new Position(7, 8) },
            { letter: 's', position: new Position(7, 9) },
            { letter: 't', position: new Position(7, 10) },
        ]);
    });

    it('should not let an objective be taken more than once', () => {
        objective = new ObjectiveAlreadyOnBoard();
        
        objective.getObjectivePoints(placement, ['test']);
        assert(objective['isAvailable']);
        let points = objective.getObjectivePoints(placement, ['test']);
        assert(!objective['isAvailable']);
        expect(points).to.equal(OBJECTIVE_ALREADY_ON_BOARD);
        points = objective.getObjectivePoints(placement, ['test']);
        assert(!objective['isAvailable']);
        expect(points).to.equal(NO_POINTS);
    });

    it('should give points for a palindrome', () => {
        objective = new ObjectivePalindrome();

        let result = objective.getObjectivePoints(placement, ['laval']);
        expect(result).to.equal(OBJECTIVE_PALINDORME);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['elle']);
        expect(result).to.equal(OBJECTIVE_PALINDORME);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['ete']);
        expect(result).to.equal(OBJECTIVE_PALINDORME);
    });

    it('should not give points for no palindrome', () => {
        objective = new ObjectivePalindrome();

        let result = objective.getObjectivePoints(placement, ['lavel']);
        expect(result).to.equal(NO_POINTS);

        result = objective.getObjectivePoints(placement, ['aa']);
        expect(result).to.equal(NO_POINTS);

        result = objective.getObjectivePoints(placement, ['etre']);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for a word already on board', () => {
        objective = new ObjectiveAlreadyOnBoard();
        const otherObjective = new ObjectivePalindrome();

        objective.getObjectivePoints(placement, ['premiertest']);
        objective.getObjectivePoints(placement, ['secondtest']);
        otherObjective.getObjectivePoints(placement, ['troisiemetest']);

        let result = objective.getObjectivePoints(placement, ['premiertest']);
        expect(result).to.equal(OBJECTIVE_ALREADY_ON_BOARD);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['secondtest']);
        expect(result).to.equal(OBJECTIVE_ALREADY_ON_BOARD);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['troisiemetest']);
        expect(result).to.equal(OBJECTIVE_ALREADY_ON_BOARD);
    });

    it('should not give points for not already on board', () => {
        objective = new ObjectiveAlreadyOnBoard();

        let result = objective.getObjectivePoints(placement, ['premiertest']);
        expect(result).to.equal(NO_POINTS);

        result = objective.getObjectivePoints(placement, ['secondtest']);
        expect(result).to.equal(NO_POINTS);

        result = objective.getObjectivePoints(placement, ['troisiemetest']);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for a 3 or more vowels word', () => {
        objective = new Objective3Vowels();

        let result = objective.getObjectivePoints(placement, ['eau']);
        expect(result).to.equal(OBJECTIVE_3_VOWELS);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['automobile']);
        expect(result).to.equal(OBJECTIVE_3_VOWELS);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['auto']);
        expect(result).to.equal(OBJECTIVE_3_VOWELS);
    });

    it('should not give points for less than 3 vowels', () => {
        objective = new Objective3Vowels();

        let result = objective.getObjectivePoints(placement, ['laval']);
        expect(result).to.equal(NO_POINTS);

        result = objective.getObjectivePoints(placement, ['aa']);
        expect(result).to.equal(NO_POINTS);

        result = objective.getObjectivePoints(placement, ['etre']);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for an anagram of a word already on board', () => {
        objective = new ObjectiveAnagram();
        const otherObjective = new ObjectivePalindrome();

        objective.getObjectivePoints(placement, ['premiertest']);
        objective.getObjectivePoints(placement, ['secondtest']);
        otherObjective.getObjectivePoints(placement, ['troisiemetest']);

        let result = objective.getObjectivePoints(placement, ['testpremier']);
        expect(result).to.equal(OBJECTIVE_ANAGRAM);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['tesecondst']);
        expect(result).to.equal(OBJECTIVE_ANAGRAM);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['testtroisieme']);
        expect(result).to.equal(OBJECTIVE_ANAGRAM);
    });

    it('should not give points for no anagram', () => {
        objective = new ObjectiveAnagram();
        objective.getObjectivePoints(placement, ['premiertttt']);

        let result = objective.getObjectivePoints(placement, ['premiertest']);
        expect(result).to.equal(NO_POINTS);

        result = objective.getObjectivePoints(placement, ['secondtest']);
        expect(result).to.equal(NO_POINTS);


        result = objective.getObjectivePoints(placement, ['troisiemetest']);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for only placing vowels', () => {
        objective = new ObjectiveOnlyVowels();

        placement = new PlacementOption(true, [
            { letter: 'a', position: new Position(7, 7) },
            { letter: 'a', position: new Position(7, 10) },
        ]);
        let result = objective.getObjectivePoints(placement, ['premiertest']);
        expect(result).to.equal(OBJECTIVE_ONLY_VOWELS);

        objective['isAvailable'] = true;
        placement = new PlacementOption(true, [
            { letter: 'a', position: new Position(7, 7) },
            { letter: 'u', position: new Position(7, 8) },
            { letter: 'o', position: new Position(7, 10) },
            { letter: 'i', position: new Position(7, 11) },
        ]);
        result = objective.getObjectivePoints(placement, ['automobile']);
        expect(result).to.equal(OBJECTIVE_ONLY_VOWELS);

        objective['isAvailable'] = true;
        placement = new PlacementOption(true, [
            { letter: 'o', position: new Position(7, 10) },
        ]);
        result = objective.getObjectivePoints(placement, ['auto']);
        expect(result).to.equal(OBJECTIVE_ONLY_VOWELS);
    });

    it('should not give points for placing not all vowels', () => {
        objective = new ObjectiveOnlyVowels();

        placement = new PlacementOption(true, [
            { letter: 'a', position: new Position(7, 7) },
            { letter: 'v', position: new Position(7, 8) },
            { letter: 'a', position: new Position(7, 9) },
        ]);
        let result = objective.getObjectivePoints(placement, ['laval']);
        expect(result).to.equal(NO_POINTS);

        objective['isAvailable'] = true;
        placement = new PlacementOption(true, [
            { letter: 'a', position: new Position(7, 7) },
            { letter: 'a', position: new Position(7, 8) },
            { letter: 's', position: new Position(7, 10) },
        ]);
        result = objective.getObjectivePoints(placement, ['aas']);
        expect(result).to.equal(NO_POINTS);

        objective['isAvailable'] = true;
        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(7, 7) },
        ]);
        result = objective.getObjectivePoints(placement, ['etre']);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for a word with 2 or more big letters', () => {
        objective = new Objective2BigLetters();

        let result = objective.getObjectivePoints(placement, ['kiwi']);
        expect(result).to.equal(OBJECTIVE_2_BIG_LETTERS);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['xqz']);
        expect(result).to.equal(OBJECTIVE_2_BIG_LETTERS);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['yak']);
        expect(result).to.equal(OBJECTIVE_2_BIG_LETTERS);
    });

    it('should not give points for less than 2 big letters', () => {
        objective = new Objective2BigLetters();

        let result = objective.getObjectivePoints(placement, ['premiertest']);
        expect(result).to.equal(NO_POINTS);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['quoi']);
        expect(result).to.equal(NO_POINTS);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['yeah']);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for a word more than 7 letters', () => {
        objective = new Objective7LettersOrMore();

        let result = objective.getObjectivePoints(placement, ['premiertest']);
        expect(result).to.equal(OBJECTIVE_7_LETTERS_OR_MORE);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['collines']);
        expect(result).to.equal(OBJECTIVE_7_LETTERS_OR_MORE);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['anticonstitutionnellement']);
        expect(result).to.equal(OBJECTIVE_7_LETTERS_OR_MORE);
    });

    it('should not give points for words with 7 letters or less', () => {
        objective = new Objective7LettersOrMore();

        let result = objective.getObjectivePoints(placement, ['test']);
        expect(result).to.equal(NO_POINTS);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['colline']);
        expect(result).to.equal(NO_POINTS);

        objective['isAvailable'] = true;
        result = objective.getObjectivePoints(placement, ['justice']);
        expect(result).to.equal(NO_POINTS);
    });

    it('should give points for a word with a letter in the corner', () => {
        objective = new ObjectiveCornerPlacement();

        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(0, 0) },
            { letter: 'e', position: new Position(0, 1) },
            { letter: 's', position: new Position(0, 2) },
            { letter: 't', position: new Position(0, 3) },
        ]);
        let result = objective.getObjectivePoints(placement, ['test']);
        expect(result).to.equal(OBJECTIVE_CORNER_PLACEMENT);

        objective['isAvailable'] = true;
        placement = new PlacementOption(true, [
            { letter: 'c', position: new Position(0, 7) },
            { letter: 'o', position: new Position(0, 8) },
            { letter: 'l', position: new Position(0, 9) },
            { letter: 'l', position: new Position(0, 10) },
            { letter: 'i', position: new Position(0, 11) },
            { letter: 'n', position: new Position(0, 12) },
            { letter: 'e', position: new Position(0, 13) },
            { letter: 's', position: new Position(0, 14) },
        ]);
        result = objective.getObjectivePoints(placement, ['test']);
        expect(result).to.equal(OBJECTIVE_CORNER_PLACEMENT);

        objective['isAvailable'] = true;
        placement = new PlacementOption(true, [
            { letter: 'c', position: new Position(14, 7) },
            { letter: 'o', position: new Position(14, 8) },
            { letter: 'l', position: new Position(14, 9) },
            { letter: 'l', position: new Position(14, 10) },
            { letter: 'i', position: new Position(14, 11) },
            { letter: 'n', position: new Position(14, 12) },
            { letter: 'e', position: new Position(14, 13) },
            { letter: 's', position: new Position(14, 14) },
        ]);
        result = objective.getObjectivePoints(placement, ['test']);
        expect(result).to.equal(OBJECTIVE_CORNER_PLACEMENT);

        objective['isAvailable'] = true;
        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(14, 0) },
            { letter: 'e', position: new Position(14, 1) },
            { letter: 's', position: new Position(14, 2) },
            { letter: 't', position: new Position(14, 3) },
        ]);
        result = objective.getObjectivePoints(placement, ['test']);
        expect(result).to.equal(OBJECTIVE_CORNER_PLACEMENT);
    });

    it('should not give points for words with no letters in the corner', () => {
        objective = new ObjectiveCornerPlacement();

        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(0, 1) },
            { letter: 'e', position: new Position(0, 2) },
            { letter: 's', position: new Position(0, 3) },
            { letter: 't', position: new Position(0, 4) },
        ]);
        let result = objective.getObjectivePoints(placement, ['test']);
        expect(result).to.equal(NO_POINTS);

        objective['isAvailable'] = true;
        objective['isAvailable'] = true;
        placement = new PlacementOption(true, [
            { letter: 'c', position: new Position(0, 7) },
            { letter: 'o', position: new Position(0, 8) },
            { letter: 'l', position: new Position(0, 9) },
            { letter: 'l', position: new Position(0, 10) },
            { letter: 'i', position: new Position(0, 11) },
            { letter: 'n', position: new Position(0, 12) },
            { letter: 'e', position: new Position(0, 13) },
        ]);
        result = objective.getObjectivePoints(placement, ['test']);
        expect(result).to.equal(NO_POINTS);

        objective['isAvailable'] = true;
        placement = new PlacementOption(true, [
            { letter: 'c', position: new Position(14, 7) },
            { letter: 'o', position: new Position(14, 8) },
            { letter: 'l', position: new Position(14, 9) },
            { letter: 'l', position: new Position(14, 10) },
            { letter: 'i', position: new Position(14, 11) },
            { letter: 'n', position: new Position(14, 12) },
            { letter: 'e', position: new Position(14, 13) },
        ]);
        result = objective.getObjectivePoints(placement, ['test']);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(14, 1) },
            { letter: 'e', position: new Position(14, 2) },
            { letter: 's', position: new Position(14, 3) },
            { letter: 't', position: new Position(14, 4) },
        ]);
        result = objective.getObjectivePoints(placement, ['test']);
        expect(result).to.equal(NO_POINTS);

        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(13, 0) },
            { letter: 'e', position: new Position(13, 1) },
            { letter: 's', position: new Position(13, 2) },
            { letter: 't', position: new Position(13, 3) },
        ]);
        result = objective.getObjectivePoints(placement, ['test']);
        expect(result).to.equal(NO_POINTS);

        objective['isAvailable'] = true;
        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(7, 7) },
            { letter: 'e', position: new Position(7, 8) },
            { letter: 's', position: new Position(7, 9) },
            { letter: 't', position: new Position(7, 10) },
        ]);
        result = objective.getObjectivePoints(placement, ['test']);
        expect(result).to.equal(NO_POINTS);
    });
});
