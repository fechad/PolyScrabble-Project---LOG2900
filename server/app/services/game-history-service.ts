import * as cst from '@app/controllers/db.controller';
import { DataBaseController } from '@app/controllers/db.controller';
import { GameHistory } from '@app/game-history';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

@Service()
export class GameHistoryService {
    private collection: Collection | undefined = undefined;
    constructor(private dataBase: DataBaseController) {}

    async connect() {
        await this.dataBase.connect();
        this.collection = this.dataBase.db?.collection(cst.GAMES_COLLECTION);
    }

    async getHistory(): Promise<GameHistory[]> {
        if (!this.collection) return [];
        else return this.collection.find({}).project({ _id: 0 }).toArray() as unknown as GameHistory[];
    }

    async addGame(gamePlayed: GameHistory) {
        if (!this.collection) return;
        await this.collection.insertOne(gamePlayed);
    }

    async clearHistory() {
        await this.collection?.drop();
        this.collection = this.dataBase.db?.collection(cst.GAMES_COLLECTION);
    }
}
