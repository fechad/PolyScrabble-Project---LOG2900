/* eslint-disable @typescript-eslint/no-magic-numbers */
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
});
