import { Difficulty, GameType, Parameters } from '@app/classes/parameters';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Game } from './game';
import { Room } from './room';
import { VirtualPlayer } from './virtual-player';
// eslint-disable-next-line @typescript-eslint/no-require-imports

describe('VirtualPlayer', () => {
    let game: Game;
    let vP: VirtualPlayer;
    let dictionnaryService: DictionnaryService;
    let parameters: Parameters;

    beforeEach(() => {
        parameters = new Parameters();
        parameters.timer = 60;
        parameters.dictionnary = 0;
        parameters.gameType = GameType.Solo;
        parameters.difficulty = Difficulty.Beginner;
        parameters.log2990 = false;
        const room = new Room(1, '1', 'Dummy', parameters);
        room.addPlayer('2', 'otherDummy', false);
        room.addPlayer('VP', 'heo', true);

        game = new Game(room, dictionnaryService);
    });
    it('playTurn should send a message v1', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        Math.random = () => 0.0;
        vP = new VirtualPlayer(true, game);
        vP.playTurn();
    });
    it('playTurn should send a message v2', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        Math.random = () => 0.1;
        vP = new VirtualPlayer(true, game);
        vP.playTurn();
    });
    it('playTurn should send a message v3', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        Math.random = () => 0.1;
        vP = new VirtualPlayer(false, game);
        vP.playTurn();
    });

    it('should playturn when current turn is my turn', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        Math.random = () => 0.1;
        vP = new VirtualPlayer(false, game);
        vP.playTurn = sinon.stub();
        game.getCurrentPlayer().id = 'VP';
        vP.waitForTurn();
        const timeout = 1500;
        setTimeout(() => {
            expect((vP.playTurn as sinon.SinonStub).args).to.deep.equal([[]]);
            done();
        }, timeout);
    });
});
