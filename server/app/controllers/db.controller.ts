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
<<<<<<< HEAD

export type DbDictionary = { id: number; title: string; description: string; words: string[] };
=======
>>>>>>> 48d55c7... can now add biginner and expert vp-players to the database and load them in admin page.

export type DbDictionary = { id: number; name: string; description: string; words: string[] };

const DB_USERNAME = 'default-user';
const DB_PASSWORD = 'Oh6Hj7L7aCXZQfAb';
const DB_URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.407r1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const DB_DB = 'scores';
export const SCORES_COLLECTION = 'scores';
export const GAMES_COLLECTION = 'games';
export const VP_COLLECTION = 'vp';
<<<<<<< HEAD
<<<<<<< HEAD
export const DICTIONARY_COLLECTION = 'dictionaries';
=======
>>>>>>> 48d55c7... can now add biginner and expert vp-players to the database and load them in admin page.
=======
export const DICTIONARY_COLLECTION = 'dictionaries';
>>>>>>> f80e2fb... able to get dictionnaries from monfoDB and show them in client view

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
<<<<<<< HEAD
<<<<<<< HEAD
export const DEFAULT_DICTIONARY: DbDictionary[] = [];
new Promise(async (resolve) => {
    const fileBuffer = await promises.readFile('./assets/dictionnary.json');
    const readDicitonnary = JSON.parse(fileBuffer.toString());
    const dictionary: DbDictionary[] = [
        { id: 0, title: readDicitonnary.title, description: readDicitonnary.description, words: readDicitonnary.words },
    ];
    resolve(dictionary);
}).then((words: DbDictionary[]) => {
    DEFAULT_DICTIONARY.push(words[0]);
    return words;
});
=======
>>>>>>> 48d55c7... can now add biginner and expert vp-players to the database and load them in admin page.
=======
export let DEFAULT_DICTIONARY: DbDictionary[] = [];
new Promise(async (resolve) => {
    const fileBuffer = await promises.readFile('./assets/dictionnary.json');
    const readDicitonnary = JSON.parse(fileBuffer.toString());
    const description = 'Dictionnaire fourni par le département de génie informatique et logiciel. Soit le dictionnaire par défaut de ce jeu.';
    const dictionary: DbDictionary[] = [{ id: 0, name: 'français', description: description, words: readDicitonnary.words }];
    //console.log(dictionary);
    resolve(dictionary);
}).then((words: DbDictionary[]) => {
    //console.log(words);
    //const dictionary: DbDictionary[] = [{ id: 0, name: 'français', description: words.description, words: readDicitonnary.words }];
    DEFAULT_DICTIONARY.push(words[0]);
    return words;
});
>>>>>>> f80e2fb... able to get dictionnaries from monfoDB and show them in client view

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
