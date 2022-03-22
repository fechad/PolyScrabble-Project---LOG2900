import { alphabetTemplate } from '@app/alphabet-template';
import { MAIN_PLAYER, OTHER_PLAYER } from '@app/constants';
import { assert, expect } from 'chai';
import { Reserve } from './reserve';

describe('Reserve', () => {
    let reserve: Reserve;
    const RACKS_LENGTH = 7;
    const RESERVE_CONTENT_LENGTH = 27;

    beforeEach(() => {
        reserve = new Reserve();
    });

    it('should have 7 elements in each rack', (done) => {
        assert(reserve.letterRacks[0].length === RACKS_LENGTH);
        assert(reserve.letterRacks[1].length === RACKS_LENGTH);
        done();
    });

    it('should return the right number of letters', (done) => {
        const numberOfLetters = 4;
        assert(reserve.drawLetters(numberOfLetters).length === numberOfLetters);
        assert(reserve.drawLetters(RACKS_LENGTH).length === RACKS_LENGTH);
        done();
    });

    it('should take the right amount of letters from the reserve', (done) => {
        const numberOfDrawnLetters = 22;
        // eslint-disable-next-line dot-notation
        const beforeReserveLength = reserve['reserve'].length;
        reserve.drawLetters(numberOfDrawnLetters);
        // eslint-disable-next-line dot-notation
        const afterReserveLength = reserve['reserve'].length;
        assert(beforeReserveLength === afterReserveLength + numberOfDrawnLetters);
        done();
    });

    it('should take the correct letters from the reserve', (done) => {
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
        done();
    });

    it('should tell if a rack is empty', (done) => {
        reserve.letterRacks[MAIN_PLAYER].length = 0;
        let result = reserve.isPlayerRackEmpty(MAIN_PLAYER);
        assert(result);

        reserve.letterRacks[MAIN_PLAYER] = [alphabetTemplate[0], alphabetTemplate[11], alphabetTemplate[11], alphabetTemplate[14]];
        result = reserve.isPlayerRackEmpty(MAIN_PLAYER);
        assert(!result);

        reserve.letterRacks[OTHER_PLAYER] = [alphabetTemplate[0], alphabetTemplate[11], alphabetTemplate[11], alphabetTemplate[14]];
        result = reserve.isPlayerRackEmpty(OTHER_PLAYER);
        assert(!result);
        done();
    });

    it('should deal with draw bigger than number in reserve', () => {
        const remainingLetters = 4;
        // eslint-disable-next-line dot-notation
        reserve.drawLetters(reserve['reserve'].length - remainingLetters);
        const letters = reserve.drawLetters(remainingLetters + 1);
        assert(letters.length === remainingLetters);
    });

    it('should update the reserve', (done) => {
        // eslint-disable-next-line dot-notation
        const lengthBefore = reserve['reserve'].length;
        reserve.updateReserve(reserve.letterRacks[0][0].name.toLowerCase(), true, true);
        // eslint-disable-next-line dot-notation
        expect(lengthBefore).to.equal(reserve['reserve'].length);

        reserve.updateReserve(reserve.letterRacks[0][0].name.toLowerCase(), false, false);
        // eslint-disable-next-line dot-notation
        expect(lengthBefore - 1).to.equal(reserve['reserve'].length);
        done();
    });

    it('should set the racks', (done) => {
        // eslint-disable-next-line dot-notation
        reserve['setRacks']();
        assert(reserve.letterRacks[0].length === RACKS_LENGTH);
        assert(reserve.letterRacks[1].length === RACKS_LENGTH);
        done();
    });

    it('reserve content should show all 27 letters (including *)', (done) => {
        assert(reserve.getContent().length === RESERVE_CONTENT_LENGTH);
        done();
    });
});
