import { alphabetTemplate } from '@app/alphabet-template';
import { assert } from 'chai';
import { MAIN_PLAYER, OTHER_PLAYER } from './game';
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
    it('empyReserve should empty the reserve', () => {
        reserve.emptyReserve();
        assert(reserve.getCount() === 0);
    });
    it('isPlayerRackEmpty should accurately tell if a rack is empty', () => {
        reserve.letterRacks[MAIN_PLAYER].length = 0;
        const firstResult = reserve.isPlayerRackEmpty(MAIN_PLAYER);
        assert(firstResult === true);

        reserve.letterRacks[OTHER_PLAYER] = [alphabetTemplate[0], alphabetTemplate[11], alphabetTemplate[11], alphabetTemplate[14]];
        const secondResult = reserve.isPlayerRackEmpty(OTHER_PLAYER);
        assert(secondResult === false);
    });
});
