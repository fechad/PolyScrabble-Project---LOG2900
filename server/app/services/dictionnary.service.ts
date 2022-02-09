import { promises } from 'fs';
import { Service } from 'typedi';

export type Dictionnary = { id: number; name: string; words: string[] };
export type DictionnaryInfo = { id: number; name: string; words: string[] };

@Service()
export class DictionnaryService {
    private dictionnaries: Dictionnary[] = [];

    // constructor() {
    //     this.dictionnaries.push(
    //         promises.readFile('./assets/dictionnary.json').then((data) => {
    //             if (data === null) throw Error('Could not read dictionnary file');
    //             return { id: 0, name: 'français', words: JSON.parse(data.toString()).words };
    //         }),
    //     );
    // }
    async init() {
        const fileBuffer = await this.readFile('./assets/dictionnary.json');
        const readDicitonnary = JSON.parse(fileBuffer.toString());
        this.dictionnaries.push(readDicitonnary.words);
    }
    async readFile(path: string) {
        return await promises.readFile(path);
    }

    getDictionnaries() {
        return this.dictionnaries.map((dict) => ({ id: dict.id, name: dict.name } as DictionnaryInfo));
    }
}
