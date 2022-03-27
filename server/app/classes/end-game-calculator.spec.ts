import { Reserve } from '@app/classes/reserve';
import { Player } from '@app/classes/room';
import { assert, expect } from 'chai';
import { EndGameCalculator } from './end-game-calculator';

/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('EndGameService', () => {
    let endGameService: EndGameCalculator;
    let reserve: Reserve;

    beforeEach(() => {
        endGameService = new EndGameCalculator();
        reserve = new Reserve();
        reserve.letterRacks = [['A', 'B'], ['C']];
    });
    it('should be created', () => {
        assert(endGameService !== undefined);
    });
    it('should calulate the final scores', () => {
        const scoreMainPlayer = 10;
        const scoreOtherPlayer = 20;
        const scores = [scoreMainPlayer, scoreOtherPlayer];
        EndGameCalculator.calculateFinalScores(scores, reserve);
        expect(scores).to.deep.equal([6, 17]);
    });
    it('createGameSummary should create a message summarizing the game', () => {
        const mainPlayer: Player = { avatar: 'a', name: 'firstName', id: 'id1', connected: true, virtual: false };
        const otherPlayer: Player = { avatar: 'b', name: 'secondName', id: 'id2', connected: true, virtual: false };
        const summary = 'Fin de partie - lettres restantes \n' + '\nfirstName: AB \n ' + '\nsecondName: C \n ';

        const result = EndGameCalculator.createGameSummaryMessage([mainPlayer, otherPlayer], reserve);
        expect(result).to.equal(summary);
    });
});
