import { assert } from 'console';
import { GameTile } from './game-tile';

describe('Game Tile', () => {
    let gameTile: GameTile;
    let gameTileMult2: GameTile;
    let gameTileWordMult3: GameTile;

    beforeEach(() => {
        gameTile = new GameTile(1);
        gameTileMult2 = new GameTile(2);
        gameTileWordMult3 = new GameTile(1, 3);
    });

    it('should be initialised with the good multipliers', (done) => {
        assert(gameTile.multiplier === 1);
        assert(gameTile.wordMultiplier === 1);

        assert(gameTileMult2.multiplier === 2);
        assert(gameTileMult2.wordMultiplier === 1);

        assert(gameTileWordMult3.multiplier === 1);
        assert(gameTileWordMult3.wordMultiplier === 3);
        done();
    });
});
