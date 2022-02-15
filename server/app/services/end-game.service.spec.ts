import { MAIN_PLAYER, OTHER_PLAYER } from '@app/classes/game';
import { Reserve } from '@app/classes/reserve';
import { Player } from '@app/classes/room';
import { assert } from 'chai';
import { EndGameService } from './end-game.service';

describe('EndGameService', () => {
    let endGameService: EndGameService;
    // let game: Game;
    let reserve: Reserve;

    beforeEach(() => {
        endGameService = new EndGameService();
        reserve = new Reserve();
    });
    it('should be created', () => {
        assert(endGameService !== undefined);
    });
    it('should calulate the final scores', () => {
        const scoreMainPlayer = 10;
        const scoreOtherPlayer = 20;
        const scores = [scoreMainPlayer, scoreOtherPlayer];
        const result = endGameService.calculateFinalScores(scores, reserve);
        assert(result);
    });
    it('should update the letter list of each rack', () => {
        endGameService.updateLetterLists(MAIN_PLAYER, reserve.letterRacks[MAIN_PLAYER]);
        assert(endGameService.mainLetterList.length);

        endGameService.updateLetterLists(OTHER_PLAYER, reserve.letterRacks[OTHER_PLAYER]);
        assert(endGameService.otherLetterList);
    });
    it('should calulate the final scores and update one of the letter lists', () => {
        const scoreMainPlayer = 10;
        const scoreOtherPlayer = 20;
        const scores = [scoreMainPlayer, scoreOtherPlayer];
        const result = endGameService.calculateFinalScores(scores, reserve);
        assert(result);
        assert((endGameService.mainLetterList || endGameService.otherLetterList) !== '');
    });
    it('createGameSummary should create a message summarizing the game', () => {
        const mainPlayer: Player = { name: 'firstName', id: 'id1', connected: true };
        const otherPlayer: Player = { name: 'secondName', id: 'id2', connected: true };
        const summary =
            'Fin de partie - lettres restantes \n' +
            `\nfirstName: ${endGameService.mainLetterList} \n ` +
            `\nsecondName: ${endGameService.otherLetterList} \n `;

        const result = endGameService.createGameSummaryMessage([mainPlayer, otherPlayer]);
        assert(result === summary);
    });
});
