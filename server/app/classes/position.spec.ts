/* eslint-disable @typescript-eslint/no-magic-numbers */
import { expect } from 'chai';
import { Position } from './position';

describe('Position', () => {
    let position: Position;

    it('should return position with offset', () => {
        position = new Position(7, 7);
        expect(position.isInBound()).to.equal(true);
        position = new Position(17, 9);
        expect(position.isInBound()).to.equal(false);
    });

    it('should see if position is in bound of board', () => {
        position = new Position(7, 7);
        const offsetPosition = position.withOffset(true, 1);
        expect(offsetPosition.col).to.equal(8);
        expect(offsetPosition.row).to.equal(7);
    });

    it('should correctly compare positions', () => {
        position = new Position(7, 7);
        const otherPosition = new Position(7, 7);
        expect(position.equals(otherPosition)).to.equal(true);
    });
});
