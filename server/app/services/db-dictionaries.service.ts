import * as cst from '@app/controllers/db.controller';
import { DataBaseController, DbDictionary, DICTIONARY_COLLECTION } from '@app/controllers/db.controller';
import * as fs from 'fs';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

export type ClientDictionaryInterface = { title: string; description: string };
type DicoPair = { oldDico: DbDictionary; newDico: DbDictionary };

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

    async updateDictionary(dictionary: DicoPair) {
        await this.collection?.findOneAndReplace({ title: { $eq: dictionary.oldDico.title } }, dictionary.newDico);
        this.editFile(dictionary);
    }

    editFile(files: DicoPair) {
        const filename = files.oldDico.title;
        const newName = files.newDico.title;
        fs.readFile(`./dictionaries/dictionary-${filename}.json`, (error, data) => {
            if (error) throw new Error();
            const result = data.toString().replace(filename, newName);

            fs.writeFile(`./dictionaries/dictionary-${filename}.json`, result, (e) => {
                if (e) throw new Error();
            });
        });

        fs.readFile(`./dictionaries/dictionary-${filename}.json`, (error, data) => {
            if (error) console.log('read desc');
            const result = data.toString().replace(files.oldDico.description, files.newDico.description);

            fs.writeFile(`./dictionaries/dictionary-${filename}.json`, result, (e) => {
                if (e) console.log('write desc');
            });
        });

        // fs.rename(`./dictionaries/dictionary-${filename}.json`, `./dictionaries/dictionary-${newName}.json`, (e) => {
        //     if (e) throw new Error();
        // });
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
