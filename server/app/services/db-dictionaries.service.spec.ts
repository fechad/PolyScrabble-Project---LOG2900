import { DataBaseController } from '@app/controllers/db.controller';
import { expect } from 'chai';
import { Collection, Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DbDictionariesService } from './db-dictionaries.service';

const COLLECTIONS: string[] = ['col'];

class DBManager {
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

describe('DbDictionariesService', () => {
    let dbDictionariesService: DbDictionariesService;
    const dataBase = new DataBaseController();
    const dataBaseManager: DBManager = new DBManager();
    let collection: Collection;

    beforeEach(async () => {
        await dataBaseManager.start();
        await dataBase.connect();
        dbDictionariesService = new DbDictionariesService(dataBase);
        collection = dataBaseManager.db.collection(COLLECTIONS[0]);
        // eslint-disable-next-line dot-notation
        dbDictionariesService['collection'] = collection;
        await collection.insertOne({ id: 0, title: 'dummy', description: 'abc', words: ['a', 'b', 'c'] });
    });

    after(async () => dataBaseManager.stop());
    afterEach(async () => dataBaseManager.cleanup());

    it('should get dictionaries', async () => {
        expect(await dbDictionariesService.getDictionaries()).to.deep.equal([{ id: 0, title: 'dummy', description: 'abc' }]);
    });
});
