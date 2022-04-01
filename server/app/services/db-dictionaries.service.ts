import * as cst from '@app/controllers/db.controller';
import { DataBaseController } from '@app/controllers/db.controller';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

export type clientDictionaryInterface = { name: string; description: string };

@Service()
export class DbDictionariesService {
    private collection: Collection | undefined = undefined;
    //private defaultDictionary: cst.DbDictionary[] = cst.DEFAULT_DICTIONARY;
    constructor(private dataBase: DataBaseController) {
        this.collection = this.dataBase.db?.collection(cst.DICTIONARY_COLLECTION);
    }

    async getDictionaries(): Promise<clientDictionaryInterface[]> {
        //await this.collection?.insertOne(cst.DEFAULT_DICTIONARY[0]);
        //console.log(cst.DEFAULT_DICTIONARY);
        if (this.collection === undefined) return cst.DEFAULT_DICTIONARY;
        const dictionaries = (await this.collection.aggregate().project({ name: 1, description: 1 }).toArray()) as clientDictionaryInterface[];
        return dictionaries;
    }

    async addDictionary(dictionary: cst.DbDictionary) {
        await this.collection?.insertOne(dictionary);
        const dictionaries = (await this.collection?.aggregate().toArray()) as cst.DbDictionary[];
        console.log(dictionaries);
    }

    async updateDictionary(vps: Object) {
        await this.collection?.findOneAndReplace({ name: { $eq: vps['oldVp'].name } }, vps['newVp']);
    }

    async deleteDictionary(name: string) {
        if (this.collection === undefined) return;
        await this.collection.deleteOne({ name: { $eq: name } });
    }
}
