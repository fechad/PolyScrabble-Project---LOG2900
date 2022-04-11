import { DataBaseController, DEFAULT_USERS } from '@app/controllers/db.controller';
import { expect } from 'chai';
import { Collection, Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { HighScoresService } from './high-scores.service';

// List your collection names here
const COLLECTIONS: string[] = ['col'];

export class DBManager {
    db: Db;
    server: MongoMemoryServer = new MongoMemoryServer();
    connection: MongoClient;

    async start() {
        this.server = await MongoMemoryServer.create();
        const url = this.server.getUri();
        this.connection = await MongoClient.connect(url);
        this.db = this.connection.db();
    }

    async stop() {
        this.connection.close();
        return this.server.stop();
    }

    async cleanup() {
        return Promise.all(COLLECTIONS.map(async (c) => this.db.collection(c).deleteMany({})));
    }
}

describe('High scores service', () => {
    let highScoresService: HighScoresService;
    const dataBase = new DataBaseController();
    const dbman: DBManager = new DBManager();
    let collection: Collection;

    beforeEach(async () => {
        await dbman.start();
        dataBase.db = dbman.db;
        highScoresService = new HighScoresService(dataBase);
        collection = dbman.db.collection(COLLECTIONS[0]);
        // eslint-disable-next-line dot-notation
        highScoresService['collection'] = collection;
    });

    after(async () => dbman.stop());
    afterEach(async () => dbman.cleanup());

    it('should add scores', async () => {
        await collection.insertMany([{ name: 'Bob', score: 34, log2990: true }]);
        await highScoresService.addScore({ name: 'Not bob', score: 35, log2990: true });
        expect(await collection.find({}).project({ _id: 0 }).toArray()).to.deep.equal([
            { name: 'Bob', score: 34, log2990: true },
            { name: 'Not bob', score: 35, log2990: true },
        ]);
    });

    it('should update scores', async () => {
        await collection.insertMany([{ name: 'Bob', score: 34, log2990: true }]);
        await highScoresService.addScore({ name: 'Bob', score: 35, log2990: true });
        await highScoresService.addScore({ name: 'Bob', score: 30, log2990: true });
        expect(await collection.find({}).project({ _id: 0 }).toArray()).to.deep.equal([{ name: 'Bob', score: 35, log2990: true }]);
    });

    it('should add scores in other mode', async () => {
        await collection.insertMany([{ name: 'Bob', score: 34, log2990: true }]);
        await highScoresService.addScore({ name: 'Bob', score: 35, log2990: false });
        expect(await collection.find({}).project({ _id: 0 }).toArray()).to.deep.equal([
            { name: 'Bob', score: 34, log2990: true },
            { name: 'Bob', score: 35, log2990: false },
        ]);
    });

    it('should update scores in other mode', async () => {
        await collection.insertMany([{ name: 'Bob', score: 34, log2990: true }]);
        await highScoresService.addScore({ name: 'Bob', score: 35, log2990: false });
        await highScoresService.addScore({ name: 'Bob', score: 36, log2990: false });
        await highScoresService.addScore({ name: 'Bob', score: 33, log2990: false });
        expect(await collection.find({}).project({ _id: 0 }).toArray()).to.deep.equal([
            { name: 'Bob', score: 34, log2990: true },
            { name: 'Bob', score: 36, log2990: false },
        ]);
    });

    it('should get dummy scores', async () => {
        expect(await highScoresService.getScores(false)).to.deep.equal(DEFAULT_USERS);
    });

    it('should get only 5 scores', async () => {
        await collection.insertMany([
            { name: 'Bob1', score: 34, log2990: true },
            { name: 'Bob2', score: 33, log2990: true },
            { name: 'Bob3', score: 32, log2990: true },
            { name: 'Bob4', score: 31, log2990: true },
            { name: 'Bob5', score: 30, log2990: true },
            { name: 'Bob6', score: 30, log2990: true },
            { name: 'Bob7', score: 30, log2990: true },
            { name: 'Bob8', score: 29, log2990: true },
            { name: 'Bob9', score: 29, log2990: true },
        ]);
        const highScores = await highScoresService.getScores(true);
        highScores.forEach((s) => s.names.sort());
        expect(highScores).to.deep.equal([
            { score: 34, names: ['Bob1'] },
            { score: 33, names: ['Bob2'] },
            { score: 32, names: ['Bob3'] },
            { score: 31, names: ['Bob4'] },
            { score: 30, names: ['Bob5', 'Bob6', 'Bob7'] },
        ]);
    });

    it('should get scores from the right category', async () => {
        await collection.insertMany([
            { name: 'Bob1', score: 34, log2990: true },
            { name: 'Bob2', score: 33, log2990: true },
            { name: 'Bob3', score: 32, log2990: true },
            { name: 'Bob4', score: 31, log2990: true },
            { name: 'Bob5', score: 30, log2990: true },
        ]);
        expect(await highScoresService.getScores(false)).to.deep.equal(DEFAULT_USERS);
    });

    it('should get partial scores', async () => {
        await collection.insertMany([
            { name: 'Bob1', score: 2.2, log2990: true },
            { name: 'Bob2', score: 1.9, log2990: true },
            { name: 'Bob3', score: -32, log2990: true },
            { name: 'Bob4', score: -31, log2990: true },
            { name: 'Bob5', score: -30, log2990: true },
        ]);
        expect(await highScoresService.getScores(true)).to.deep.equal([
            DEFAULT_USERS[0],
            { score: 2.2, names: ['Bob1'] },
            DEFAULT_USERS[1],
            { score: 1.9, names: ['Bob2'] },
            DEFAULT_USERS[2],
        ]);
    });

    it('should reset scores', async () => {
        await collection.insertMany([
            { name: 'Bob1', score: 2.2, log2990: true },
            { name: 'Bob2', score: 1.9, log2990: true },
            { name: 'Bob3', score: -32, log2990: true },
            { name: 'Bob4', score: -31, log2990: true },
            { name: 'Bob5', score: -30, log2990: true },
        ]);
        await highScoresService.resetScores();
        expect(await highScoresService.getScores(true)).to.deep.equal(DEFAULT_USERS);
    });

    it('should merge scores with defaults', async () => {
        await collection.insertMany([
            { name: 'Bob1', score: 2, log2990: false },
            { name: 'Bob2', score: 3, log2990: false },
        ]);
        expect(await highScoresService.getScores(false)).to.deep.equal([
            { score: 3, names: ['Bob2', ...DEFAULT_USERS[0].names] },
            { score: 2, names: ['Bob1', ...DEFAULT_USERS[1].names] },
            DEFAULT_USERS[2],
            DEFAULT_USERS[3],
            DEFAULT_USERS[4],
        ]);
    });

    it('should return defaults when not connected to db', async () => {
        // eslint-disable-next-line dot-notation
        highScoresService['db'] = null;
        expect(await highScoresService.getScores(true)).to.deep.equal(DEFAULT_USERS);
        expect(async () => await highScoresService.addScore({ name: 'Dummy', score: 400, log2990: true })).not.to.throw();
    });
});
