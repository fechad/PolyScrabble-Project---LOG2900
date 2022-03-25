import * as cst from '@app/controllers/db.controller';
import { DataBaseController } from '@app/controllers/db.controller';
import { GameHistory } from '@app/game-history';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

@Service()
export class GameHistoryService {
    private collection: Collection | undefined = undefined;
    constructor(private dataBase: DataBaseController) {
        this.collection = this.dataBase.db?.collection(cst.GAMES_COLLECTION);
    }

    async getHistory(): Promise<GameHistory[]> {
        if (this.collection === undefined) return [];
        else return this.collection.aggregate() as unknown as GameHistory[];
    }

    async addGame(gamePlayed: GameHistory) {
        if (this.collection === undefined) return;
        await this.collection.insertOne(gamePlayed);
    }
}
