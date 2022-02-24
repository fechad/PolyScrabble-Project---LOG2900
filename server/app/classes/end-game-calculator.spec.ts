import { Reserve } from '@app/classes/reserve';
import { Player } from '@app/classes/room';
import { assert } from 'chai';
import { EndGameCalculator } from './end-game-calculator';

describe('EndGameService', () => {
    let endGameService: EndGameCalculator;
    let reserve: Reserve;

    beforeEach(() => {
        endGameService = new EndGameCalculator();
        reserve = new Reserve();
        reserve.letterRacks = [
            [
                { name: 'A', score: 1, quantity: 20, id: 0 },
                { name: 'B', score: 1, quantity: 3, id: 1 },
            ],
            [{ name: 'C', score: 2, quantity: 2, id: 2 }],
        ];
    });
    it('should be created', () => {
        assert(endGameService !== undefined);
    });
    it('should calulate the final scores', () => {
        const scoreMainPlayer = 10;
        const scoreOtherPlayer = 20;
        const scores = [scoreMainPlayer, scoreOtherPlayer];
        const result = EndGameCalculator.calculateFinalScores(scores, reserve);
        assert(result);
    });
    it('should calulate the final scores and update one of the letter lists', () => {
        const scoreMainPlayer = 10;
        const scoreOtherPlayer = 20;
        const scores = [scoreMainPlayer, scoreOtherPlayer];
        const result = EndGameCalculator.calculateFinalScores(scores, reserve);
        assert(result);
    });
    it('createGameSummary should create a message summarizing the game', () => {
        const mainPlayer: Player = { name: 'firstName', id: 'id1', connected: true };
        const otherPlayer: Player = { name: 'secondName', id: 'id2', connected: true };
        const summary = 'Fin de partie - lettres restantes \n' + '\nfirstName: AB \n ' + '\nsecondName: C \n ';

        const result = EndGameCalculator.createGameSummaryMessage([mainPlayer, otherPlayer], reserve);
        assert(result === summary);
    });
});
