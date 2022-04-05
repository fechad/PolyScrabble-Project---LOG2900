import * as cst from '@app/controllers/db.controller';
import { DataBaseController, DbDictionary, DICTIONARY_COLLECTION } from '@app/controllers/db.controller';
import * as fs from 'fs';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

type WholeDictionary = { title: string; description: string; words: string[] };
export type ClientDictionaryInterface = { id: number; title: string; description: string };
type DicoPair = { oldDico: DbDictionary; newDico: DbDictionary };

@Service()
export class DbDictionariesService {
    private collection: Collection | undefined = undefined;
    constructor(private dataBase: DataBaseController) {
        this.collection = this.dataBase.db?.collection(DICTIONARY_COLLECTION);
    }

    async getDictionaries(): Promise<ClientDictionaryInterface[]> {
        if (!this.collection) return cst.DEFAULT_DICTIONARY;
        const dictionaries = (await this.collection
            .aggregate()
            .project({ id: 1, title: 1, description: 1 })
            .toArray()) as ClientDictionaryInterface[];
        return dictionaries;
    }

    async addDictionary(dictionary: DbDictionary): Promise<string> {
        let response = 'trying to upload';
        const filteredDictionary: ClientDictionaryInterface = { id: dictionary.id, title: dictionary.title, description: dictionary.description };
        await this.collection?.insertOne(filteredDictionary);
        const fileToCreate: WholeDictionary = { title: dictionary.title, description: dictionary.description, words: dictionary.words };
        const jsonDictionary = JSON.stringify(fileToCreate);
        await new Promise((resolve, reject) => {
            fs.writeFile(`./dictionaries/dictionary-${dictionary.id}.json`, jsonDictionary, (error: Error) => {
                if (error) {
                    response = 'failed to upload';
                    reject(response);
                } else {
                    response = 'success';
                    resolve(response);
                }
            });
        });
        this.syncDictionaries();

        return response;
    }

    async updateDictionary(dictionary: DicoPair) {
        await this.collection?.findOneAndReplace({ title: { $eq: dictionary.oldDico.title } }, dictionary.newDico);
        this.editFile(dictionary);
    }

    editFile(files: DicoPair) {
        const filename = files.oldDico.id;
        const newName = files.newDico.title;
        fs.readFile(`./dictionaries/dictionary-${filename}.json`, (error, data) => {
            if (error) throw new Error();
            const changeTitle = data.toString().replace(files.oldDico.title, newName);
            const changeDesc = changeTitle.replace(files.oldDico.description, files.newDico.description);
            console.log(changeDesc);
            fs.writeFile(`./dictionaries/dictionary-${filename}.json`, changeDesc, (e) => {
                if (e) throw new Error();
            });
        });
    }

    syncDictionaries() {
        fs.readdir('./dictionaries/', (err, files) => {
            files.forEach(async (file) => {
                const id = Number(file.split('-')[1][0]);
                await this.removeDictionaryFile(id);
            });
        });
    }

    async removeDictionaryFile(fileId: number) {
        const newList: number[] = [];
        const dictionaries = (await this.collection
            ?.aggregate()
            .project({ id: 1, title: 1, description: 1, _id: 0 })
            .toArray()) as ClientDictionaryInterface[];

        for (const dict of dictionaries) {
            newList.push(dict.id);
        }

        if (!newList.includes(fileId)) {
            fs.unlink(`./dictionaries/dictionary-${fileId}.json`, (error) => {
                if (error) throw error;
            });
        }
    }

    async deleteDictionary(id: string) {
        if (!this.collection) return;
        await this.collection.deleteOne({ id: { $eq: Number(id) } });
        this.syncDictionaries();
    }
}
