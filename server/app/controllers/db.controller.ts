import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';

export type User = { name: string; score: number; log2990: boolean };
export type Score = { score: number; names: string[] };

const DB_USERNAME = 'default-user';
const DB_PASSWORD = 'Oh6Hj7L7aCXZQfAb';
const DB_URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.407r1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const DB_DB = 'scores';
export const SCORES_COLLECTION = 'scores';
export const GAMES_COLLECTION = 'games';

export const MAX_RESULTS = 5;
export const DEFAULT_USERS: Score[] = [
    { score: 3, names: ['Justin St-Arnaud'] },
    { score: 2, names: ['Fedwin Chatelier'] },
    { score: 1, names: ['Anna Guo'] },
    { score: 0, names: ["Xavier L'Heureux"] },
    { score: -42, names: ['François Tourigny'] },
];

@Service()
export class DataBaseController {
    db: Db | null = null;

    async connect() {
        try {
            const client = new MongoClient(DB_URL);
            await client.connect();
            this.db = client.db(DB_DB);
        } catch (e) {
            console.error('Could not connect to mongodb', e);
        }
    }
}
