import * as cst from '@app/controllers/db.controller';
import { DataBaseController, DbDictionary, DICTIONARY_COLLECTION } from '@app/controllers/db.controller';
import * as fs from 'fs';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

export type ClientDictionaryInterface = { title: string; description: string };

@Service()
export class DbDictionariesService {
    private collection: Collection | undefined = undefined;
    constructor(private dataBase: DataBaseController) {
        this.collection = this.dataBase.db?.collection(DICTIONARY_COLLECTION);
    }

    async getDictionaries(): Promise<ClientDictionaryInterface[]> {
        if (this.collection === undefined) return cst.DEFAULT_DICTIONARY;
        const dictionaries = (await this.collection.aggregate().project({ title: 1, description: 1 }).toArray()) as ClientDictionaryInterface[];
        return dictionaries;
    }

    async addDictionary(dictionary: DbDictionary) {
        const filteredDictionary: ClientDictionaryInterface = { title: dictionary.title, description: dictionary.description };
        await this.collection?.insertOne(filteredDictionary);
        const jsonDictionary = JSON.stringify(dictionary);
        fs.writeFile(`./dictionaries/dictionary-${dictionary.title}.json`, jsonDictionary, (error: Error) => {
            if (error) throw error;
        });
        this.syncDictionaries();
    }

    async updateDictionary(dictionary: { oldDict: DbDictionary; newDict: DbDictionary }) {
        await this.collection?.findOneAndReplace({ title: { $eq: dictionary.oldDict.title } }, dictionary.newDict);
    }

    async syncDictionaries() {
        const dictionaries = (await this.collection
            ?.aggregate()
            .project({ title: 1, description: 1, _id: 0 })
            .toArray()) as ClientDictionaryInterface[];
        fs.readdir('./dictionaries/', (err, files) => {
            files.forEach((file) => {
                const data = fs.readFileSync(`./dictionaries/${file}`);
                const fileString = JSON.parse(data.toString());

                this.findDictionary(fileString, dictionaries);
            });
        });
    }

    findDictionary(file: DbDictionary, dictionaries: ClientDictionaryInterface[]) {
        const newArray = [];
        for (const dict of dictionaries) {
            newArray.push(dict.title);
        }
        if (!newArray.includes(file.title)) {
            fs.unlink(`./dictionaries/dictionary-${file.title}.json`, (error) => {
                if (error) throw error;
            });
        }
    }

    async deleteDictionary(name: string) {
        if (this.collection === undefined) return;
        await this.collection.deleteOne({ title: { $eq: name } });
        this.syncDictionaries();
    }
}
