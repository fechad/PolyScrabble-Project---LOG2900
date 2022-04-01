import * as cst from '@app/controllers/db.controller';
import { DataBaseController } from '@app/controllers/db.controller';
import * as fs from 'fs';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

export type ClientDictionaryInterface = { title: string; description: string };

@Service()
export class DbDictionariesService {
    private collection: Collection | undefined = undefined;
    // private defaultDictionary: cst.DbDictionary[] = cst.DEFAULT_DICTIONARY;
    constructor(private dataBase: DataBaseController) {
        this.collection = this.dataBase.db?.collection(cst.DICTIONARY_COLLECTION);
    }

    async getDictionaries(): Promise<ClientDictionaryInterface[]> {
        if (this.collection === undefined) return cst.DEFAULT_DICTIONARY;
        const dictionaries = (await this.collection.aggregate().project({ title: 1, description: 1 }).toArray()) as ClientDictionaryInterface[];
        this.syncDictionaries();
        console.log(dictionaries);
        return dictionaries;
    }

    async addDictionary(dictionary: cst.DbDictionary) {
        const filteredDictionary: ClientDictionaryInterface = { title: dictionary.title, description: dictionary.description };
        await this.collection?.insertOne(filteredDictionary);
        const jsonDictionary = JSON.stringify(dictionary);
        fs.writeFile(`./dictionaries/dictionary-${dictionary.title}.json`, jsonDictionary, (error: Error) => {
            if (error) throw error;
        });
    }

    // async updateDictionary(vps: Object) {
    //     await this.collection?.findOneAndReplace({ name: { $eq: vps.oldVp.name } }, vps.newVp);
    // }

    async syncDictionaries() {
        const dictionaries = (await this.collection?.aggregate().toArray()) as ClientDictionaryInterface[];

        fs.readdir('./dictionaries/', (err, files) => {
            files.forEach((file) => {
                const data = fs.readFileSync(`./dictionaries/${file}`);
                const fileString = JSON.parse(data.toString());

                this.findDictionary(fileString, dictionaries);
            });
        });
    }

    findDictionary(file: cst.DbDictionary, dictionaries: ClientDictionaryInterface[]) {
        for (const dict of dictionaries) {
            if (dict.title !== file.title) {
                fs.unlink(`./dictionaries/dictionary-${file.title}.json`, (error) => {
                    if (error) throw error;
                });
            }
        }
    }

    async deleteDictionary(name: string) {
        if (this.collection === undefined) return;
        await this.collection.deleteOne({ title: { $eq: name } });
        // await this.collection.deleteMany({});
    }
}
