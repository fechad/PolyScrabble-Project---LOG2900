import { Dictionnary, DictionnaryInfo } from '@app/classes/dictionary';
import * as fs from 'fs';
import { promises } from 'fs';
import { Service } from 'typedi';

@Service()
export class DictionnaryService {
    readonly dictionnaries: Dictionnary[] = [];

    async init() {
        if (this.dictionnaries.length !== 0) return;
        const fileBuffer = await promises.readFile('./assets/dictionnary.json');
        const readDictionary = JSON.parse(fileBuffer.toString());
        this.dictionnaries.push(new Dictionnary(0, 'français', readDictionary.words));
    }

    async copyDictionaries() {
        const files = await fs.promises.readdir('./dictionaries/');
        this.dictionnaries.splice(1);
        for (const file of files) {
            const id = Number(file.split('-')[1][0]);
            if (id !== 0) {
                const fileBuffer = await promises.readFile(`./dictionaries/dictionary-${id}.json`);
                const readDictionary = JSON.parse(fileBuffer.toString());
                this.dictionnaries.push(new Dictionnary(readDictionary.id, readDictionary.title, readDictionary.words));
            }
        }
    }

    getDictionnaries(): DictionnaryInfo[] {
        return this.dictionnaries.map((dict) => dict.getInfo());
    }
}
