import { assert } from 'chai';
import { EndGameService } from './end-game.service';

describe('Rooms service', () => {
    let endGameService: EndGameService;

    beforeEach(() => {
        endGameService = new EndGameService();
    });
    it('should be created', () => {
        assert(endGameService !== undefined);
    });
});
