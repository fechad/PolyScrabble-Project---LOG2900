/* eslint-disable @typescript-eslint/no-magic-numbers */
import { WordConnection } from '@app/services/dictionnary-trie.service';
import { expect } from 'chai';
import { PlacementOption } from './placement-option';

describe('Placement Option', () => {
    let placementOption: PlacementOption;
    beforeEach(() => {
        placementOption = new PlacementOption(7, 7, true, 'A');
    });

    it('should return a copy', () => {
        let copy = placementOption.deepCopy('A');
        expect(copy).to.not.equal(placementOption);
        copy = placementOption.deepCopy('B');
        expect(copy).to.not.equal(placementOption);
    });

    it('should create a valid command', () => {
        placementOption.word = 'bonjour';
        let placement: WordConnection[] = [{ connectedLetter: 'b', index: 0, isOnBoard: true }];
        placementOption.buildCommand(placement);
        expect(placementOption.command).to.equal('onjour');
        placement = [{ connectedLetter: 'j', index: 3, isOnBoard: false }];
        placementOption.buildCommand(placement);
        expect(placementOption.command).to.equal('bonjour');
    });
});
