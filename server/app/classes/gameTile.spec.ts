import { assert } from "console";
import { GameTile } from "./gameTile";

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
        assert(gameTile['letter'] === undefined);
        assert(gameTile['letterValue'] === undefined);
        assert(gameTile.empty);
        gameTile.setLetter('a');
        assert(gameTile['letter'] === 'a');
        assert(gameTile['letterValue'] === 1);
        assert(!gameTile.empty);
        done();
    });

    it('should not set something else then a letter as letter', (done) => {
        gameTile.setLetter('4');
        assert(gameTile['letter'] === undefined);
        assert(gameTile['letterValue'] === undefined);
        assert(gameTile.empty);

        gameTile.setLetter('*');
        assert(gameTile['letter'] === undefined);
        assert(gameTile['letterValue'] === undefined);
        assert(gameTile.empty);

        gameTile.setLetter('word');
        assert(gameTile['letter'] === undefined);
        assert(gameTile['letterValue'] === undefined);
        assert(gameTile.empty);
        done();
    });

    it('should get points of the tile', (done) => {
        assert(gameTile['letter'] === undefined);
        assert(gameTile['letterValue'] === undefined);
        assert(gameTile.empty);
        
        assert(gameTileMult2['letter'] === undefined);
        assert(gameTileMult2['letterValue'] === undefined);
        assert(gameTileMult2.empty);

        assert(gameTileWordMult3['letter'] === undefined);
        assert(gameTileWordMult3['letterValue'] === undefined);
        assert(gameTileWordMult3.empty);

        //TODO: test other letters values than 1
        gameTile.setLetter('a');
        gameTileMult2.setLetter('i');
        gameTileWordMult3.setLetter('o');

        assert(gameTile['letter'] === 'a');
        assert(gameTile['letterValue'] === 1);
        assert(!gameTile.empty);

        assert(gameTileMult2['letter'] === 'i');
        assert(gameTileMult2['letterValue'] === 1);
        assert(gameTileMult2.getPoints() === 2);
        assert(!gameTileMult2.empty);

        assert(gameTileWordMult3['letter'] === 'o');
        assert(gameTileWordMult3['letterValue'] === 1);
        assert(!gameTileWordMult3.empty);
        done();
    });

    it('should not get points if there is no letter', (done) => {
        assert(gameTile['letter'] === undefined);
        assert(gameTile['letterValue'] === undefined);
        assert(gameTile.getPoints() === -1);
        done();
    });

    it('should set 0 points for a special letter', (done) => {
        assert(gameTile['letter'] === undefined);
        assert(gameTile['letterValue'] === undefined);
        
        gameTile.setLetter('A');

        assert(gameTile['letter'] === 'a');
        assert(gameTile['letterValue'] === 0);
        assert(gameTile.getPoints() === 0);
        
        done();
    });

});