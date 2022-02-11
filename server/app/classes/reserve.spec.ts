import { assert } from 'chai';
import { Reserve } from './reserve';

describe('Reserve', () => {
    let reserve: Reserve;
    const racksLength = 7;

    beforeEach(() => {
        reserve = new Reserve();
    });
    it('should have 7 elements in each rack', () => {
        assert(reserve.letterRacks[0].length === racksLength);
        assert(reserve.letterRacks[1].length === racksLength);
    });
    it('should return the right number of letters', () => {
        const numberOfLetters = 4;
        assert(reserve.drawLetters(numberOfLetters).length === numberOfLetters);
        assert(reserve.drawLetters(racksLength).length === racksLength);
    });

    it('should take the right amount of letters from the reserve', () => {
        const numberOfDrawnLetters = 22;
        // eslint-disable-next-line dot-notation
        const beforeReserveLength = reserve['reserve'].length;
        reserve.drawLetters(numberOfDrawnLetters);
        // eslint-disable-next-line dot-notation
        const afterReserveLength = reserve['reserve'].length;
        assert(beforeReserveLength === afterReserveLength + numberOfDrawnLetters);
    });

    it('should take the correct letters from the reserve', () => {
        const numberOfDrawnLetters = 5;
        // eslint-disable-next-line dot-notation
        const beforeReserve = reserve['reserve'];
        const drawnLetters = reserve.drawLetters(numberOfDrawnLetters);
        // eslint-disable-next-line dot-notation
        const afterReserve = reserve['reserve'];
        // assert(beforeReserve !== afterReserve);
        afterReserve.concat(drawnLetters).sort((a, b) => a.id - b.id);
        beforeReserve.sort((a, b) => a.id - b.id);
        for (let i = 0; i < beforeReserve.length; i++) {
            assert(beforeReserve[i].name === afterReserve[i].name);
        }
    });
});
