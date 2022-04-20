import { DataBaseController } from '@app/controllers/db.controller';
import { GameHistory, GameMode, PlayerGameInfo } from '@app/game-history';
import { expect } from 'chai';
import { Collection } from 'mongodb';
import { GameHistoryService } from './game-history-service';
import { DBManager } from './high-scores.service.spec';

describe('Game History Service', () => {
    let gameHistoryService: GameHistoryService;
    const dataBase = new DataBaseController();
    const dbman: DBManager = new DBManager();
    let collection: Collection;
    let playedGame: GameHistory;

    before(() => {
        const firstPlayer: PlayerGameInfo = { name: 'justin', pointsScored: 67, replacedBy: null };
        const secondPlayer: PlayerGameInfo = { name: 'frank', pointsScored: 109, replacedBy: null };

        playedGame = {
            startTime: new Date(),
            length: '0 min 3 sec',
            firstPlayer: secondPlayer,
            secondPlayer: firstPlayer,
            mode: GameMode.Classic,
        };
    });
    beforeEach(async () => {
        await dbman.start();
        dataBase.db = dbman.db;
        gameHistoryService = new GameHistoryService(dataBase);
        collection = dbman.db.collection('col');
        // eslint-disable-next-line dot-notation
        gameHistoryService['collection'] = collection;
    });

    after(async () => dbman.stop());
    afterEach(async () => dbman.cleanup());

    it('should add game to DB', async () => {
        await gameHistoryService.addGame({ ...playedGame });
        expect(await collection.find({}).project({ _id: 0 }).toArray()).to.deep.equal([{ ...playedGame }]);
    });
    it('should get games from DB', async () => {
        await gameHistoryService.addGame({ ...playedGame });
        expect(await gameHistoryService.getHistory()).to.deep.equal([{ ...playedGame }]);
    });

    it('should clear games from DB', async () => {
        await gameHistoryService.addGame({ ...playedGame });
        expect(await gameHistoryService.getHistory()).to.deep.equal([{ ...playedGame }]);
        await gameHistoryService.clearHistory();
        expect(await gameHistoryService.getHistory()).to.deep.equal([]);
        await gameHistoryService.addGame({ ...playedGame });
        expect(await gameHistoryService.getHistory()).to.deep.equal([{ ...playedGame }]);
    });
});
