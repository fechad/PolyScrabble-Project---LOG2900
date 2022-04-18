import * as cst from '@app/controllers/db.controller';
import { DataBaseController, Score, User } from '@app/controllers/db.controller';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

@Service()
export class HighScoresService {
    private collection: Collection | undefined = undefined;
    constructor(private dataBase: DataBaseController) {}

    async connect() {
        await this.dataBase.connect();
        this.collection = this.dataBase.db?.collection(cst.SCORES_COLLECTION);
    }

    async resetScores(res: Response): Promise<void> {
        res.header({ 'content-type': 'text/plain' });
        try {
            await this?.collection?.deleteMany({});
            res.status(StatusCodes.OK).send('Succès: Réinitialisation des meilleurs scores.');
        } catch (e) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Échec: Meilleurs scores non réinitialisés.');
        }
    }

    async getScores(log2990: boolean): Promise<Score[]> {
        if (!this.collection) return cst.DEFAULT_USERS;
        let leaderboard = (await this.collection
            .aggregate([
                { $match: { log2990 } },
                { $group: { _id: '$score', score: { $max: '$score' }, names: { $addToSet: '$name' } } },
                { $sort: { score: -1 } },
            ])
            .limit(cst.MAX_RESULTS)
            .project({ _id: 0, log2990: 0 })
            .toArray()) as Score[];
        leaderboard.push(...cst.DEFAULT_USERS);
        leaderboard.sort((s1, s2) => s2.score - s1.score);
        leaderboard = leaderboard.reduce((arr, score) => {
            if (arr.length > 0 && arr[arr.length - 1].score === score.score) {
                arr[arr.length - 1].names.push(...score.names);
            } else {
                arr.push(score);
            }
            return arr;
        }, [] as Score[]);
        leaderboard.splice(cst.MAX_RESULTS);
        return leaderboard;
    }

    async addScore(user: User) {
        if (!this.collection) return;
        const current = await this.collection.findOne({ name: user.name, log2990: user.log2990 });
        if (!current) {
            await this.collection.insertOne(user);
        } else if (current.score < user.score) {
            await this.collection.updateOne({ name: user.name, log2990: user.log2990 }, { $set: { score: user.score } });
        }
    }
}
