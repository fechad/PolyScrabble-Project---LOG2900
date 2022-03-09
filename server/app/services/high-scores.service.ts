import { Collection, MongoClient } from 'mongodb';
import { Service } from 'typedi';

type User = { name: string; score: number; log2990: boolean };
type Score = { score: number; names: string[] };

const DB_USERNAME = 'default-user';
const DB_PASSWORD = 'Oh6Hj7L7aCXZQfAb';
const DB_URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.407r1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const DB_DB = 'scores';
const DB_COLLECTION = 'scores';

export const DEFAULT_USERS: Score[] = [
    { score: 3, names: ['Justin Saint-Arnaud'] },
    { score: 2, names: ['Fedwin Chatelier'] },
    { score: 1, names: ['Anna Guo'] },
    { score: 0, names: ["Xavier L'Heureux"] },
    { score: -42, names: ['François Tourigny'] },
];
const MAX_RESULTS = 5;

@Service()
export class HighScoresService {
    private db: Collection | null = null;

    async connect() {
        try {
            const client = new MongoClient(DB_URL);
            await client.connect();
            this.db = client.db(DB_DB).collection(DB_COLLECTION);
        } catch (e) {
            console.error('Could not connect to mongodb', e);
        }
    }

    async getScores(log2990: boolean): Promise<Score[]> {
        if (this.db === null) return DEFAULT_USERS;
        const leaderboard = (await this.db
            .aggregate([
                { $match: { log2990 } },
                { $group: { _id: '$score', score: { $max: '$score' }, names: { $addToSet: '$name' } } },
                { $sort: { score: -1 } },
            ])
            .limit(MAX_RESULTS)
            .project({ _id: 0, log2990: 0 })
            .toArray()) as Score[];
        leaderboard.push(...DEFAULT_USERS);
        leaderboard.sort((s1, s2) => s2.score - s1.score);
        leaderboard.splice(MAX_RESULTS);
        return leaderboard;
    }

    async addScore(user: User) {
        if (this.db === null) return;
        const current = await this.db.findOne({ name: user.name, log2990: user.log2990 });
        if (!current) {
            await this.db.insertOne(user);
        } else if (current.score < user.score) {
            await this.db.updateOne({ name: user.name, log2990: user.log2990 }, { $set: { score: user.score } });
        }
    }
}
