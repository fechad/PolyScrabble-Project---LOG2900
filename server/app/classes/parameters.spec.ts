import { expect } from 'chai';
import { GameType, Parameters } from './parameters';

describe('Parameters', () => {
    let parameters: Parameters;

    beforeEach(async () => {
        parameters = new Parameters();
    });

    it('should have default parameters', () => {
        expect(parameters.timer).to.equal(30);
        expect(parameters.gameType).to.equal(GameType.Multiplayer);
        expect(parameters.dictionnary).to.equal(0);
        expect(parameters.difficulty).to.equal(undefined);
    });
});
