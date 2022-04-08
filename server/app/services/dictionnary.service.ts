import { Dictionnary, DictionnaryInfo } from '@app/classes/dictionnary';
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

    getDictionnaries(): DictionnaryInfo[] {
        return this.dictionnaries.map((dict) => dict.getInfo());
    }
}
