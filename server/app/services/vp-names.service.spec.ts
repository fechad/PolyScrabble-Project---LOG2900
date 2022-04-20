import { DataBaseController, DEFAULT_VPS, VP } from '@app/controllers/db.controller';
import { expect } from 'chai';
import * as express from 'express';
import { Collection, Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as sinon from 'sinon';
import { VpNamesService, VpPair } from './vp-names.service';

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

describe('VpNamesService', () => {
    let vpNamesService: VpNamesService;
    const dataBase = new DataBaseController();
    const dataBaseManager: DBManager = new DBManager();
    let collection: Collection;

    beforeEach(async () => {
        await dataBaseManager.start();
        dataBase.db = dataBaseManager.db;
        vpNamesService = new VpNamesService(dataBase);
        collection = dataBaseManager.db.collection(COLLECTIONS[0]);
        // pour pouvoir accéder à l'atribut private
        // eslint-disable-next-line dot-notation
        vpNamesService['vpCollection'] = collection;
        await collection.insertOne({ default: true, beginer: true, name: 'Dummy' });
        await collection.insertOne({ default: false, beginer: true, name: 'Alex' });
        await collection.insertOne({ default: true, beginer: false, name: 'Dummer' });
        await collection.insertOne({ default: false, beginer: false, name: 'Antoine' });
    });

    after(async () => dataBaseManager.stop());
    afterEach(async () => {
        dataBaseManager.cleanup();
    });
    it('should return default virtual player names if no collection exists', async () => {
        // eslint-disable-next-line dot-notation
        vpNamesService['vpCollection'] = undefined;
        expect(await vpNamesService.getNames()).to.deep.equal(DEFAULT_VPS);
    });

    it('should not delete if no collection exists', async () => {
        // eslint-disable-next-line dot-notation
        vpNamesService['vpCollection'] = undefined;
        await vpNamesService.deleteVP('Antoine');
        expect(await vpNamesService.getNames()).to.deep.equal(DEFAULT_VPS);
    });

    it('should get virtual player names', async () => {
        expect(await vpNamesService.getNames()).to.deep.equal([
            { default: true, beginer: true, name: 'Dummy' },
            { default: false, beginer: true, name: 'Alex' },
            { default: true, beginer: false, name: 'Dummer' },
            { default: false, beginer: false, name: 'Antoine' },
        ]);
    });
    it('should add virtual player names', async () => {
        const newVp: VP = { default: false, beginner: true, name: 'Jean' };
        const status = sinon.stub();
        const resStub = {
            status: sinon.stub().returns({ send: status }),
            header: sinon.stub(),
        } as unknown as express.Response;
        await vpNamesService.addVP(newVp, resStub);
        expect(await vpNamesService.getNames()).to.deep.equal([
            { default: true, beginer: true, name: 'Dummy' },
            { default: false, beginer: true, name: 'Alex' },
            { default: true, beginer: false, name: 'Dummer' },
            { default: false, beginer: false, name: 'Antoine' },
            { default: false, beginner: true, name: 'Jean' },
        ]);
    });

    it('should update virtual player names', async () => {
        const oldVp: VP = { default: false, beginner: true, name: 'Antoine' };
        const newVp: VP = { default: false, beginner: true, name: 'Christophe' };
        const newUpdate: VpPair = { oldVp, newVp };
        await vpNamesService.updateVP(newUpdate);
        expect(await vpNamesService.getNames()).to.deep.equal([
            { default: true, beginer: true, name: 'Dummy' },
            { default: false, beginer: true, name: 'Alex' },
            { default: true, beginer: false, name: 'Dummer' },
            { default: false, beginner: true, name: 'Christophe' },
        ]);
    });

    it('should delete virtual player names', async () => {
        const name = 'Antoine';
        await vpNamesService.deleteVP(name);
        expect(await vpNamesService.getNames()).to.deep.equal([
            { default: true, beginer: true, name: 'Dummy' },
            { default: false, beginer: true, name: 'Alex' },
            { default: true, beginer: false, name: 'Dummer' },
        ]);
    });

    it('should delete all virtual player names except default ones', async () => {
        await vpNamesService.deleteAll();
        expect(await vpNamesService.getNames()).to.deep.equal([
            { default: true, beginer: true, name: 'Dummy' },
            { default: true, beginer: false, name: 'Dummer' },
        ]);
    });
});
