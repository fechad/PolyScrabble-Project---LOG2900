import { promises } from 'fs';
import { Service } from 'typedi';

export type Dictionnary = { id: number; name: string; words: string[] };
export type DictionnaryInfo = { id: number; name: string; words: string[] };

@Service()
export class DictionnaryService {
    private dictionnaries: Promise<Dictionnary>[] = [];

    constructor() {
        this.dictionnaries.push(
            promises.readFile('./assets/dictionnary.json').then((data) => {
                if (data === null) throw Error('Could not read dictionnary file');
                return { id: 0, name: 'français', words: JSON.parse(data.toString()).words };
            }),
        );
    }

    getDictionnaries(): Promise<DictionnaryInfo>[] {
        return this.dictionnaries.map(async (d) => d.then((dict) => ({ id: dict.id, name: dict.name } as DictionnaryInfo)));
    }
}
