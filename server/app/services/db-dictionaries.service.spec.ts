import { DataBaseController, DbDictionary } from '@app/controllers/db.controller';
import { expect } from 'chai';
import * as fs from 'fs';
import { Collection, Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DbDictionariesService, DictPair } from './db-dictionaries.service';
import sinon = require('sinon');
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
    let sandbox: sinon.SinonSandbox;
    beforeEach(async () => {
        await dataBaseManager.start();
        await dataBase.connect();
        dbDictionariesService = new DbDictionariesService(dataBase);
        collection = dataBaseManager.db.collection(COLLECTIONS[0]);
        // pour pouvoir accéder à l'atribut private
        // eslint-disable-next-line dot-notation
        dbDictionariesService['collection'] = collection;
        await collection.insertOne({ id: 0, title: 'dummy', description: 'abc', words: ['a', 'b', 'c'] });
        sandbox = sinon.createSandbox();
    });

    after(async () => dataBaseManager.stop());
    afterEach(async () => {
        dataBaseManager.cleanup();
        sandbox.restore();
    });

    it('should get dictionaries', async () => {
        expect(await dbDictionariesService.getDictionaries()).to.deep.equal([{ id: 0, title: 'dummy', description: 'abc' }]);
    });
    it('should add dictionary', async () => {
        const stub = sandbox.stub(fs.promises, 'writeFile').returns(Promise.resolve());
        const newDictionary = { id: 1, title: 'dummy', description: 'def', words: ['d', 'e', 'f'] };
        dbDictionariesService.addDictionary(newDictionary);
        expect(await dbDictionariesService.getDictionaries()).to.deep.equal([
            { id: 0, title: 'dummy', description: 'abc' },
            { id: 1, title: 'dummy', description: 'def' },
        ]);
        expect(stub.callCount).to.equal(1);
    });

    it('should update dictionary', async () => {
        sandbox.stub(dbDictionariesService, 'editFile').returns(Promise.resolve());
        const oldDictionary: DbDictionary = { id: 0, title: 'dummy', description: 'abc', words: ['a', 'b', 'c'] };
        const newDictionary: DbDictionary = { id: 0, title: 'dumdum', description: 'def', words: ['d', 'e', 'f'] };
        const newUpdate: DictPair = { oldDictionary, newDictionary };
        await dbDictionariesService.updateDictionary(newUpdate);
        expect(await dbDictionariesService.getDictionaries()).to.deep.equal([{ id: 0, title: 'dumdum', description: 'def' }]);
    });

    it('should delete dictionary', async () => {
        sinon.stub(dbDictionariesService, 'syncDictionaries').returns(Promise.resolve());
        const id = '0';
        dbDictionariesService.deleteDictionary(id);
        expect(await dbDictionariesService.getDictionaries()).to.deep.equal([]);
    });

    it('should remove dictionary File', async () => {
        const stub = sandbox.stub(fs.promises, 'unlink').returns(Promise.resolve());
        const fileId = 1;
        await dbDictionariesService.removeDictionaryFile(fileId);
        expect(stub.called).to.equal(true);
    });

    it('should download dictionary File', async () => {
        const fileId = '0';
        let downloadLink = '';
        sinon.stub(fs.promises, 'access').returns(
            new Promise((resolve) => {
                downloadLink = `./dictionaries/dictionary-${fileId}.json`;
                resolve();
            }),
        );
        await dbDictionariesService.downloadDictionary(fileId);
        expect(downloadLink).to.equal(`./dictionaries/dictionary-${fileId}.json`);
    });

    it('should remove dictionary File when sync function is called and dictionary not available in database', async () => {
        const unlink = sandbox.stub(fs.promises, 'unlink').returns(Promise.resolve());
        const availableFiles = [0, 1];
        sandbox.stub(fs.promises, 'readdir').callsFake(async () => {
            for (const file of availableFiles) await dbDictionariesService.removeDictionaryFile(file);
            return [];
        });
        await dbDictionariesService.syncDictionaries();
        expect(unlink.called).to.equal(true);
    });

    it('should edit dictionary File', async () => {
        let file = ['abc', 'dummy'];
        const oldDictionary: DbDictionary = { id: 0, title: 'dummy', description: 'abc', words: ['a', 'b', 'c'] };
        const newDictionary: DbDictionary = { id: 0, title: 'dumdum', description: 'def', words: ['d', 'e', 'f'] };
        const newUpdate: DictPair = { oldDictionary, newDictionary };

        sandbox.stub(fs.promises, 'readFile').returns(
            new Promise((resolve) => {
                file = ['def', 'dumdum'];
                resolve(file[0]);
            }),
        );
        sandbox.stub(fs.promises, 'writeFile').returns(
            new Promise((resolve) => {
                file = ['def', 'dumdum'];
                resolve();
            }),
        );

        await dbDictionariesService.editFile(newUpdate);
        expect(file).to.deep.equal(['def', 'dumdum']);
    });
});
