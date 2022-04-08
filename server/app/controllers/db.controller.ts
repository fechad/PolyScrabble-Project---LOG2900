import { promises } from 'fs';
import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';

export type User = { name: string; score: number; log2990: boolean };
export type Score = { score: number; names: string[] };
export type VP = {
    default: boolean;
    beginner: boolean;
    name: string;
};

export type DbDictionary = { id: number; title: string; description: string; words: string[] };

const DB_USERNAME = 'default-user';
const DB_PASSWORD = 'Oh6Hj7L7aCXZQfAb';
const DB_URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.407r1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const DB_DB = 'scores';
export const SCORES_COLLECTION = 'scores';
export const GAMES_COLLECTION = 'games';
export const VP_COLLECTION = 'vp';
export const DICTIONARY_COLLECTION = 'dictionaries';

export const MAX_RESULTS = 5;
export const DEFAULT_USERS: Score[] = [
    { score: 3, names: ['Justin St-Arnaud'] },
    { score: 2, names: ['Fedwin Chatelier'] },
    { score: 1, names: ['Anna Guo'] },
    { score: 0, names: ["Xavier L'Heureux"] },
    { score: -42, names: ['François Tourigny'] },
];

export const DEFAULT_VPS: VP[] = [
    { default: true, beginner: true, name: 'François' },
    { default: true, beginner: true, name: 'Etienne' },
    { default: true, beginner: true, name: 'Anna' },
    { default: true, beginner: false, name: 'Fedwin' },
    { default: true, beginner: false, name: 'Justin' },
    { default: true, beginner: false, name: 'Xavier' },
];
export const DEFAULT_DICTIONARY: DbDictionary[] = [];
// need to wait for file reading
// eslint-disable-next-line no-async-promise-executor
new Promise(async (resolve) => {
    const fileBuffer = await promises.readFile('./assets/dictionnary.json');
    const readDictionary = JSON.parse(fileBuffer.toString());
    const dictionary: DbDictionary[] = [{ id: 0, title: readDictionary.title, description: readDictionary.description, words: readDictionary.words }];
    resolve(dictionary);
}).then((words: DbDictionary[]) => {
    DEFAULT_DICTIONARY.push(words[0]);
    return words;
});

@Service()
export class DataBaseController {
    db: Db | null = null;
    /* istanbul ignore next */
    async connect() {
        if (this.db) return;
        try {
            const client = new MongoClient(DB_URL);
            await client.connect();
            this.db = client.db(DB_DB);
        } catch (e) {
            console.error('Could not connect to mongodb', e);
        }
    }
}
