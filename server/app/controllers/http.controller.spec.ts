import { Application } from '@app/app';
import { Game } from '@app/classes/game';
import { Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import { ClientDictionaryInterface, DbDictionariesService } from '@app/services/db-dictionaries.service';
import { DictionnaryInfo, DictionnaryService } from '@app/services/dictionnary.service';
import { GameHistoryService } from '@app/services/game-history-service';
import { HighScoresService } from '@app/services/high-scores.service';
import { LoginsService } from '@app/services/logins.service';
import { RoomsService } from '@app/services/rooms.service';
import { VpNamesService } from '@app/services/vp-names.service';
import { expect } from 'chai';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { DataBaseController } from './db.controller';

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
        return Promise.all(['collection'].map(async (c) => this.db.collection(c).deleteMany({})));
    }
}

describe('HttpController', () => {
    const DICTIONNARIES = [{ id: 0, name: 'français', words: ['a', 'b', 'c'] }] as DictionnaryInfo[];
    const HIGH_SCORES_LOG2990 = [
        { score: 34, names: ['Bob', 'Bob1'] },
        { score: 33, names: ['Bo', 'B'] },
    ];
    const HIGH_SCORES_NORMAL = [
        { score: 34, names: ['Bb', 'Bb1'] },
        { score: 33, names: ['oBo', 'oB'] },
    ];
    const ID = 'Bob';
    const TOKEN = 42;

    const DEFAULT_VPS = [
        { default: true, beginner: true, name: 'François' },
        { default: true, beginner: true, name: 'Etienne' },
        { default: true, beginner: true, name: 'Anna' },
        { default: true, beginner: false, name: 'Fedwin' },
        { default: true, beginner: false, name: 'Justin' },
        { default: true, beginner: false, name: 'Xavier' },
    ];

    const DICTIONARY: ClientDictionaryInterface[] = [{ id: 0, title: 'Mon dictionnaire', description: 'Description de base' }];

    let highScoreService: SinonStubbedInstance<HighScoresService>;
    let dictionnaryService: SinonStubbedInstance<DictionnaryService>;
    let gameHistoryService: SinonStubbedInstance<GameHistoryService>;
    let vpNamesService: SinonStubbedInstance<VpNamesService>;
    let dbDictionaryService: SinonStubbedInstance<DbDictionariesService>;
    const dataBase = new DataBaseController();
    const dataBaseManager: DBManager = new DBManager();
    let roomsService: RoomsService;
    let expressApp: Express.Application;

    before(async () => {
        await dataBaseManager.start();
        await dataBase.connect();
        dictionnaryService = createStubInstance(DictionnaryService);
        dictionnaryService.getDictionnaries.returns(DICTIONNARIES);
        dictionnaryService.init.callsFake(async () => Promise.resolve());
        highScoreService = createStubInstance(HighScoresService);
        highScoreService.resetScores.callsFake(async (res) => {
            res.status(StatusCodes.OK).send('succes');
        });
        await highScoreService.connect();
        highScoreService.getScores.callsFake(async (log2990) => (log2990 ? HIGH_SCORES_LOG2990 : HIGH_SCORES_NORMAL));
        gameHistoryService = createStubInstance(GameHistoryService);
        vpNamesService = createStubInstance(VpNamesService);
        vpNamesService.getNames.returns(Promise.resolve(DEFAULT_VPS));
        dbDictionaryService = createStubInstance(DbDictionariesService);
        dbDictionaryService.getDictionaries.returns(Promise.resolve(DICTIONARY));
        dbDictionaryService.syncDictionaries.returns(Promise.resolve());
        dbDictionaryService.downloadDictionary.returns(Promise.resolve('/dictionaries/dictionary-test.json'));
        await gameHistoryService.connect();
        const loginsService = createStubInstance(LoginsService);
        loginsService.verify.callsFake((id, token) => id === ID && token === TOKEN);
        roomsService = new RoomsService();
        Container.set(DictionnaryService, dictionnaryService);
        Container.set(VpNamesService, vpNamesService);
        Container.set(DbDictionariesService, dbDictionaryService);
        Container.set(HighScoresService, highScoreService);
        Container.set(LoginsService, loginsService);
        Container.set(RoomsService, roomsService);
        Container.set(DataBaseController, dataBase);
        const app = Container.get(Application);
        expressApp = app.app;
    });

    beforeEach(() => {
        while (roomsService.rooms.length > 0) roomsService.rooms.pop();
        while (roomsService.games.length > 0) roomsService.games.pop();
        highScoreService.addScore.reset();
    });

    after(() => {
        Container.reset();
        dataBaseManager.stop();
    });
    afterEach(async () => {
        dataBaseManager.cleanup();
    });

    it('should return dictionnaries on request to /dictionnaries', async () => {
        const response = await supertest(expressApp).get('/api/dictionnaries').expect(StatusCodes.OK);
        expect(response.body).to.deep.equal(DICTIONNARIES);
    });

    it('should return normal high scores', async () => {
        const response = await supertest(expressApp).get('/api/high-scores').expect(StatusCodes.OK);
        expect(response.body).to.deep.equal(HIGH_SCORES_NORMAL);
    });

    it('should return log2990 high scores', async () => {
        const response = await supertest(expressApp).get('/api/high-scores/log2990').expect(StatusCodes.OK);
        expect(response.body).to.deep.equal(HIGH_SCORES_LOG2990);
    });

    it('should reset high scores', async () => {
        const response = await supertest(expressApp).delete('/api/high-scores').expect(StatusCodes.OK);
        expect(response.body).to.deep.equal({});
    });

    it('should not add high scores when the input format is not respected', async () => {
        await supertest(expressApp).post('/api/high-scores').expect(StatusCodes.BAD_REQUEST);
        await supertest(expressApp).post('/api/high-scores').send({ id: ID, room: 0 }).expect(StatusCodes.BAD_REQUEST);
        await supertest(expressApp).post('/api/high-scores').send({ token: TOKEN, room: 0 }).expect(StatusCodes.BAD_REQUEST);
        await supertest(expressApp).post('/api/high-scores').send({ id: ID, tokenn: TOKEN, room: 0 }).expect(StatusCodes.BAD_REQUEST);
    });

    it('should not add high scores when wrong identifier/token pair', async () => {
        await supertest(expressApp)
            .post('/api/high-scores')
            .send({ id: ID, token: TOKEN + 1, room: 0 })
            .expect(StatusCodes.UNAUTHORIZED);
    });

    it('should not add high scores when not in room', async () => {
        await supertest(expressApp).post('/api/high-scores').send({ id: ID, token: TOKEN, room: 0 }).expect(StatusCodes.NOT_FOUND);
        const room2 = new Room(1, 'DummyId2', 'Dummy2', new Parameters());
        room2.addPlayer('DummyId3', 'Dummy3', false, 'a');
        roomsService.rooms.push(new Room(0, 'DummyId', 'Dummy', new Parameters()), room2);
        await supertest(expressApp).post('/api/high-scores').send({ id: ID, token: TOKEN, room: 0 }).expect(StatusCodes.FORBIDDEN);
    });

    it('should not add high scores when room not in game', async () => {
        roomsService.rooms.push(new Room(0, ID, 'Dummy', new Parameters()));
        await supertest(expressApp).post('/api/high-scores').send({ id: ID, token: TOKEN, room: 0 }).expect(StatusCodes.NOT_FOUND);
    });

    it('should not add score if virtual player', async () => {
        const room = new Room(0, ID + 1, 'Dummy', new Parameters());
        room.addPlayer(ID, 'Not Dummy', true, 'a');
        roomsService.rooms.push(room);
        roomsService.games.push(
            new Game(roomsService.rooms[0], dictionnaryService as unknown as DictionnaryService, gameHistoryService as unknown as GameHistoryService),
        );
        await supertest(expressApp).post('/api/high-scores').send({ id: ID, token: TOKEN, room: 0 }).expect(StatusCodes.FORBIDDEN);
    });

    it('should add score for main player in normal mode', async () => {
        const room = new Room(0, ID, 'Dummy', new Parameters());
        room.addPlayer(ID + 1, 'Not Dummy', false, 'a');
        roomsService.rooms.push(room);
        roomsService.games.push(
            new Game(roomsService.rooms[0], dictionnaryService as unknown as DictionnaryService, gameHistoryService as unknown as GameHistoryService),
        );
        await supertest(expressApp).post('/api/high-scores').send({ id: ID, token: TOKEN, room: 0 }).expect(StatusCodes.ACCEPTED);
        expect(highScoreService.addScore.args).to.deep.equal([[{ name: 'Dummy', score: 0, log2990: false }]]);
    });

    it('should add score for other player in normal mode', async () => {
        const room = new Room(0, ID + 1, 'Dummy', new Parameters());
        room.addPlayer(ID, 'Not Dummy', false, 'a');
        roomsService.rooms.push(room);
        roomsService.games.push(
            new Game(roomsService.rooms[0], dictionnaryService as unknown as DictionnaryService, gameHistoryService as unknown as GameHistoryService),
        );
        await supertest(expressApp).post('/api/high-scores').send({ id: ID, token: TOKEN, room: 0 }).expect(StatusCodes.ACCEPTED);
        expect(highScoreService.addScore.args).to.deep.equal([[{ name: 'Not Dummy', score: 0, log2990: false }]]);
    });

    it('should add score for main player in LOG2990 mode', async () => {
        const params = new Parameters();
        params.log2990 = true;
        const room = new Room(0, ID, 'Dummy', params);
        room.addPlayer(ID + 1, 'Not Dummy', false, 'a');
        roomsService.rooms.push(room);
        roomsService.games.push(
            new Game(roomsService.rooms[0], dictionnaryService as unknown as DictionnaryService, gameHistoryService as unknown as GameHistoryService),
        );
        await supertest(expressApp).post('/api/high-scores').send({ id: ID, token: TOKEN, room: 0 }).expect(StatusCodes.ACCEPTED);
        expect(highScoreService.addScore.args).to.deep.equal([[{ name: 'Dummy', score: 0, log2990: true }]]);
    });

    it('should add score for other player in LOG2990 mode', async () => {
        const params = new Parameters();
        params.log2990 = true;
        const room = new Room(0, ID + 1, 'Dummy', params);
        room.addPlayer(ID, 'Not Dummy', false, 'a');
        roomsService.rooms.push(room);
        roomsService.games.push(
            new Game(roomsService.rooms[0], dictionnaryService as unknown as DictionnaryService, gameHistoryService as unknown as GameHistoryService),
        );
        await supertest(expressApp).post('/api/high-scores').send({ id: ID, token: TOKEN, room: 0 }).expect(StatusCodes.ACCEPTED);
        expect(highScoreService.addScore.args).to.deep.equal([[{ name: 'Not Dummy', score: 0, log2990: true }]]);
    });

    it('should return default virtual player names on request to /vp-names', async () => {
        const response = await supertest(expressApp).get('/api/vp-names').expect(StatusCodes.OK);
        expect(response.body).to.deep.equal(DEFAULT_VPS);
    });

    it('should add virtual player', async () => {
        await supertest(expressApp).post('/api/vp-names').send({ default: false, beginner: true, name: 'Test' }).expect(StatusCodes.OK);
    });

    it('should update virtual player', async () => {
        await supertest(expressApp).patch('/api/vp-names').send({ default: false, beginner: true, name: 'Hi' }).expect(StatusCodes.OK);
    });

    it('should delete virtual player', async () => {
        await supertest(expressApp).delete('/api/vp-names/:name').send({ name: 'Hi' }).expect(StatusCodes.OK);
    });

    it('should return default dictionary on request to /dictionaries', async () => {
        const response = await supertest(expressApp).get('/api/dictionaries').expect(StatusCodes.OK);
        expect(response.body).to.deep.equal(DICTIONARY);
    });

    it('should add dictionary', async () => {
        await supertest(expressApp)
            .post('/api/dictionaries')
            .send({ id: 20, title: 'Test', description: 'Testing', words: ['a', 'b'] })
            .expect(StatusCodes.OK);
        expect(dbDictionaryService.addDictionary.args[0]).to.deep.equal([{ id: 20, title: 'Test', description: 'Testing', words: ['a', 'b'] }]);
    });

    it('should update dictionaries', async () => {
        await supertest(expressApp)
            .patch('/api/dictionaries')
            .send({ id: 20, title: 'Modif', description: 'Testing', words: ['a', 'b'] })
            .expect(StatusCodes.OK);
    });

    it('should delete dictionaries', async () => {
        await supertest(expressApp).delete('/api/dictionaries/:id').send({ id: '3' }).expect(StatusCodes.OK);
    });

    it('should reset dictionaries', async () => {
        await supertest(expressApp).delete('/api/dictionaries-reset').expect(StatusCodes.OK);
    });

    it('should reset virtual player names to default', async () => {
        await supertest(expressApp).delete('/api/vp-names-reset').expect(StatusCodes.OK);
    });

    it('should download dictionaries', async () => {
        sinon.stub(express.response.download);
        await supertest(expressApp).get('/api/dictionary-files/0').expect(StatusCodes.NOT_FOUND);
        expect(dbDictionaryService.downloadDictionary.args[0][0]).to.deep.equal('0');
    });
});
