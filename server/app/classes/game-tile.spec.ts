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

    it('should set a letter', (done) => {
        gameTile.setLetter('a');

        // eslint-disable-next-line dot-notation
        assert(gameTile['letter'] === 'a');
        // eslint-disable-next-line dot-notation
        assert(gameTile['letterValue'] === 1);
        assert(!gameTile.empty);
        done();
    });

    it('should get the char of the letter', (done) => {
        gameTile.setLetter('a');

        // eslint-disable-next-line dot-notation
        assert(gameTile['letter'] === 'a');
        // eslint-disable-next-line dot-notation
        assert(gameTile['letterValue'] === 1);
        assert(!gameTile.empty);
        const char = gameTile.getChar();
        assert(char === 'a');
        done();
    });

    it('should not set something else then a letter as letter', (done) => {
        gameTile.setLetter('4');
        // eslint-disable-next-line dot-notation
        assert(gameTile['letter'] === undefined);
        assert(gameTile.empty);

        gameTile.setLetter('*');
        // eslint-disable-next-line dot-notation
        assert(gameTile['letter'] === undefined);
        assert(gameTile.empty);

        gameTile.setLetter('word');
        // eslint-disable-next-line dot-notation
        assert(gameTile['letter'] === undefined);
        assert(gameTile.empty);
        done();
    });

    it('should get points of the tile', (done) => {
        gameTile.setLetter('b');
        gameTileMult2.setLetter('i');
        gameTileWordMult3.setLetter('o');

        assert(gameTile.getChar() === 'b');
        // eslint-disable-next-line dot-notation
        assert(gameTile['letterValue'] === 3);
        assert(gameTile.getPoints() === 3);
        assert(!gameTile.empty);

        assert(gameTileMult2.getChar() === 'i');
        // eslint-disable-next-line dot-notation
        assert(gameTileMult2['letterValue'] === 1);
        assert(gameTileMult2.getPoints() === 2);
        gameTileMult2.newlyPlaced = false;
        assert(gameTileMult2.getPoints() === 1);
        assert(!gameTileMult2.empty);

        assert(gameTileWordMult3.getChar() === 'o');
        // eslint-disable-next-line dot-notation
        assert(gameTileWordMult3['letterValue'] === 1);
        assert(!gameTileWordMult3.empty);
        done();
    });

    it('should not get points if there is no letter', (done) => {
        const invalid = -1;
        // eslint-disable-next-line dot-notation
        assert(gameTile['letter'] === undefined);
        // eslint-disable-next-line dot-notation
        assert(gameTile['letterValue'] === undefined);
        assert(gameTile.getPoints() === invalid);
        done();
    });

    it('should set 0 points for a special letter', (done) => {
        gameTile.setLetter('A');
        assert(gameTile.getChar() === 'a');
        // eslint-disable-next-line dot-notation
        assert(gameTile['letterValue'] === 0);
        assert(gameTile.getPoints() === 0);
        done();
    });
});
