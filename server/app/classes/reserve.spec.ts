import { MAIN_PLAYER, OTHER_PLAYER } from '@app/constants';
import { expect } from 'chai';
import { Reserve } from './reserve';

describe('Reserve', () => {
    let reserve: Reserve;
    const RACKS_LENGTH = 7;
    const RESERVE_CONTENT_LENGTH = 27;

    beforeEach(() => {
        reserve = new Reserve();
    });

    it('should have 7 elements in each rack', (done) => {
        expect(reserve.letterRacks[0].length).to.equal(RACKS_LENGTH);
        expect(reserve.letterRacks[1].length).to.equal(RACKS_LENGTH);
        done();
    });

    it('should return the right number of letters', (done) => {
        const numberOfLetters = 4;
        expect(reserve.drawLetters(numberOfLetters).length).to.equal(numberOfLetters);
        expect(reserve.drawLetters(RACKS_LENGTH).length).to.equal(RACKS_LENGTH);
        done();
    });

    it('should take the right amount of letters from the reserve', (done) => {
        const numberOfDrawnLetters = 22;
        // eslint-disable-next-line dot-notation
        const beforeReserveLength = reserve['reserve'].length;
        reserve.drawLetters(numberOfDrawnLetters);
        // eslint-disable-next-line dot-notation
        const afterReserveLength = reserve['reserve'].length;
        expect(beforeReserveLength).to.equal(afterReserveLength + numberOfDrawnLetters);
        done();
    });

    it('should take the correct letters from the reserve', () => {
        const numberOfDrawnLetters = 5;
        // eslint-disable-next-line dot-notation
        const beforeReserve = reserve['reserve'].slice();
        const drawnLetters = reserve.drawLetters(numberOfDrawnLetters);
        // eslint-disable-next-line dot-notation
        const afterReserve = reserve['reserve'].concat(drawnLetters).sort();
        beforeReserve.sort();
        expect(beforeReserve).to.deep.equal(afterReserve);
    });

    it('should tell if a rack is empty', () => {
        reserve.letterRacks[MAIN_PLAYER].length = 0;
        let result = reserve.isPlayerRackEmpty(MAIN_PLAYER);
        expect(result).to.equal(true);

        reserve.letterRacks[MAIN_PLAYER] = [...'ALLO'];
        result = reserve.isPlayerRackEmpty(MAIN_PLAYER);
        expect(result).to.equal(false);

        reserve.letterRacks[OTHER_PLAYER] = [...'ALLO'];
        result = reserve.isPlayerRackEmpty(OTHER_PLAYER);
        expect(result).to.equal(false);
    });

    it('should deal with draw bigger than number in reserve', () => {
        const remainingLetters = 4;
        // eslint-disable-next-line dot-notation
        reserve.drawLetters(reserve['reserve'].length - remainingLetters);
        const letters = reserve.drawLetters(remainingLetters + 1);
        expect(letters.length).to.equal(remainingLetters);
    });

    it('should update the reserve', (done) => {
        // eslint-disable-next-line dot-notation
        const lengthBefore = reserve['reserve'].length;
        reserve.updateReserve([reserve.letterRacks[0][0].toLowerCase()], true, true);
        // eslint-disable-next-line dot-notation
        expect(reserve['reserve'].length).to.equal(lengthBefore);

        reserve.updateReserve([reserve.letterRacks[1][0].toLowerCase()], false, false);
        // eslint-disable-next-line dot-notation
        expect(reserve['reserve'].length).to.equal(lengthBefore - 1);
        done();
    });

    it('should set the racks', (done) => {
        // eslint-disable-next-line dot-notation
        reserve['setRacks']();
        expect(reserve.letterRacks[0].length).to.equal(RACKS_LENGTH);
        expect(reserve.letterRacks[1].length).to.equal(RACKS_LENGTH);
        done();
    });

    it('reserve content should show all 27 letters (including *)', (done) => {
        expect(Object.keys(reserve.getContent()).length).to.equal(RESERVE_CONTENT_LENGTH);
        done();
    });
});
