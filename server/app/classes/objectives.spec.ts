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
    ObjectivePalindrome
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
        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(7, 7) },
            { letter: 'e', position: new Position(7, 8) },
            { letter: 's', position: new Position(7, 9) },
            { letter: 't', position: new Position(7, 10) },
        ]);
    });

    it('should give points for a palindrome', () => {
        objective = new ObjectivePalindrome();

        let result = objective.isAccomplished(placement, ['laval']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['elle']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['ete']);
        expect(result).to.equal(true);
    });

    it('should not give points for no palindrome', () => {
        objective = new ObjectivePalindrome();

        let result = objective.isAccomplished(placement, ['lavel']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['aa']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['etre']);
        expect(result).to.equal(false);
    });

    it('should give points for a word already on board', () => {
        objective = new ObjectiveAlreadyOnBoard();
        const otherObjective = new ObjectivePalindrome();

        objective.isAccomplished(placement, ['premiertest']);
        objective.isAccomplished(placement, ['secondtest']);
        otherObjective.isAccomplished(placement, ['troisiemetest']);

        let result = objective.isAccomplished(placement, ['premiertest']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['secondtest']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['troisiemetest']);
        expect(result).to.equal(false);
    });

    it('should not give points for not already on board', () => {
        objective = new ObjectiveAlreadyOnBoard();

        let result = objective.isAccomplished(placement, ['premiertest']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['secondtest']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['troisiemetest']);
        expect(result).to.equal(false);
    });

    it('should give points for a 3 or more vowels word', () => {
        objective = new Objective3Vowels();

        let result = objective.isAccomplished(placement, ['eau']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['automobile']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['auto']);
        expect(result).to.equal(true);
    });

    it('should not give points for less than 3 vowels', () => {
        objective = new Objective3Vowels();

        let result = objective.isAccomplished(placement, ['laval']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['aa']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['etre']);
        expect(result).to.equal(false);
    });

    it('should give points for an anagram of a word already on board', () => {
        objective = new ObjectiveAnagram();
        const otherObjective = new ObjectivePalindrome();

        objective.isAccomplished(placement, ['premiertest']);
        objective.isAccomplished(placement, ['secondtest']);
        otherObjective.isAccomplished(placement, ['troisiemetest']);

        let result = objective.isAccomplished(placement, ['testpremier']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['tesecondst']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['testtroisieme']);
        expect(result).to.equal(false);
    });

    it('should not give points for no anagram', () => {
        objective = new ObjectiveAnagram();
        objective.isAccomplished(placement, ['premiertttt']);

        let result = objective.isAccomplished(placement, ['premiertest']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['secondtest']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['troisiemetest']);
        expect(result).to.equal(false);
    });

    it('should give points for only placing vowels', () => {
        objective = new ObjectiveOnlyVowels();

        placement = new PlacementOption(true, [
            { letter: 'a', position: new Position(7, 7) },
            { letter: 'a', position: new Position(7, 10) },
        ]);
        let result = objective.isAccomplished(placement, ['premiertest']);
        expect(result).to.equal(true);

        placement = new PlacementOption(true, [
            { letter: 'a', position: new Position(7, 7) },
            { letter: 'u', position: new Position(7, 8) },
            { letter: 'o', position: new Position(7, 10) },
            { letter: 'i', position: new Position(7, 11) },
        ]);
        result = objective.isAccomplished(placement, ['automobile']);
        expect(result).to.equal(true);

        placement = new PlacementOption(true, [{ letter: 'o', position: new Position(7, 10) }]);
        result = objective.isAccomplished(placement, ['auto']);
        expect(result).to.equal(true);
    });

    it('should not give points for placing not all vowels', () => {
        objective = new ObjectiveOnlyVowels();

        placement = new PlacementOption(true, [
            { letter: 'a', position: new Position(7, 7) },
            { letter: 'v', position: new Position(7, 8) },
            { letter: 'a', position: new Position(7, 9) },
        ]);
        let result = objective.isAccomplished(placement, ['laval']);
        expect(result).to.equal(false);

        placement = new PlacementOption(true, [
            { letter: 'a', position: new Position(7, 7) },
            { letter: 'a', position: new Position(7, 8) },
            { letter: 's', position: new Position(7, 10) },
        ]);
        result = objective.isAccomplished(placement, ['aas']);
        expect(result).to.equal(false);

        placement = new PlacementOption(true, [{ letter: 't', position: new Position(7, 7) }]);
        result = objective.isAccomplished(placement, ['etre']);
        expect(result).to.equal(false);
    });

    it('should give points for a word with 2 or more big letters', () => {
        objective = new Objective2BigLetters();

        let result = objective.isAccomplished(placement, ['kiwi']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['xqz']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['yak']);
        expect(result).to.equal(true);
    });

    it('should not give points for less than 2 big letters', () => {
        objective = new Objective2BigLetters();

        let result = objective.isAccomplished(placement, ['premiertest']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['quoi']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['yeah']);
        expect(result).to.equal(false);
    });

    it('should give points for a word more than 7 letters', () => {
        objective = new Objective7LettersOrMore();

        let result = objective.isAccomplished(placement, ['premiertest']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['collines']);
        expect(result).to.equal(true);

        result = objective.isAccomplished(placement, ['anticonstitutionnellement']);
        expect(result).to.equal(true);
    });

    it('should not give points for words with 7 letters or less', () => {
        objective = new Objective7LettersOrMore();

        let result = objective.isAccomplished(placement, ['test']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['colline']);
        expect(result).to.equal(false);

        result = objective.isAccomplished(placement, ['justice']);
        expect(result).to.equal(false);
    });

    it('should give points for a word with a letter in the corner', () => {
        objective = new ObjectiveCornerPlacement();

        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(0, 0) },
            { letter: 'e', position: new Position(0, 1) },
            { letter: 's', position: new Position(0, 2) },
            { letter: 't', position: new Position(0, 3) },
        ]);
        let result = objective.isAccomplished(placement, ['test']);
        expect(result).to.equal(true);

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
        result = objective.isAccomplished(placement, ['test']);
        expect(result).to.equal(true);

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
        result = objective.isAccomplished(placement, ['test']);
        expect(result).to.equal(true);

        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(14, 0) },
            { letter: 'e', position: new Position(14, 1) },
            { letter: 's', position: new Position(14, 2) },
            { letter: 't', position: new Position(14, 3) },
        ]);
        result = objective.isAccomplished(placement, ['test']);
        expect(result).to.equal(true);
    });

    it('should not give points for words with no letters in the corner', () => {
        objective = new ObjectiveCornerPlacement();

        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(0, 1) },
            { letter: 'e', position: new Position(0, 2) },
            { letter: 's', position: new Position(0, 3) },
            { letter: 't', position: new Position(0, 4) },
        ]);
        let result = objective.isAccomplished(placement, ['test']);
        expect(result).to.equal(false);

        placement = new PlacementOption(true, [
            { letter: 'c', position: new Position(0, 7) },
            { letter: 'o', position: new Position(0, 8) },
            { letter: 'l', position: new Position(0, 9) },
            { letter: 'l', position: new Position(0, 10) },
            { letter: 'i', position: new Position(0, 11) },
            { letter: 'n', position: new Position(0, 12) },
            { letter: 'e', position: new Position(0, 13) },
        ]);
        result = objective.isAccomplished(placement, ['test']);
        expect(result).to.equal(false);

        placement = new PlacementOption(true, [
            { letter: 'c', position: new Position(14, 7) },
            { letter: 'o', position: new Position(14, 8) },
            { letter: 'l', position: new Position(14, 9) },
            { letter: 'l', position: new Position(14, 10) },
            { letter: 'i', position: new Position(14, 11) },
            { letter: 'n', position: new Position(14, 12) },
            { letter: 'e', position: new Position(14, 13) },
        ]);
        result = objective.isAccomplished(placement, ['test']);
        expect(result).to.equal(false);

        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(14, 1) },
            { letter: 'e', position: new Position(14, 2) },
            { letter: 's', position: new Position(14, 3) },
            { letter: 't', position: new Position(14, 4) },
        ]);
        result = objective.isAccomplished(placement, ['test']);
        expect(result).to.equal(false);

        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(13, 0) },
            { letter: 'e', position: new Position(13, 1) },
            { letter: 's', position: new Position(13, 2) },
            { letter: 't', position: new Position(13, 3) },
        ]);
        result = objective.isAccomplished(placement, ['test']);
        expect(result).to.equal(false);

        placement = new PlacementOption(true, [
            { letter: 't', position: new Position(7, 7) },
            { letter: 'e', position: new Position(7, 8) },
            { letter: 's', position: new Position(7, 9) },
            { letter: 't', position: new Position(7, 10) },
        ]);
        result = objective.isAccomplished(placement, ['test']);
        expect(result).to.equal(false);
    });
});
