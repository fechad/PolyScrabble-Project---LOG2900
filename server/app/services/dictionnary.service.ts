import { promises } from 'fs';
import { Service } from 'typedi';

export type Dictionnary = { id: number; name: string; words: string[] };
export type DictionnaryInfo = { id: number; name: string; words: string[] };

@Service()
export class DictionnaryService {
    private dictionnaries: Dictionnary[] = [];

    async init() {
        const fileBuffer = await this.readFile('./assets/dictionnary.json');
        const readDicitonnary = JSON.parse(fileBuffer.toString());
        this.dictionnaries.push({ id: 0, name: 'français', words: readDicitonnary.words });
    }

    async readFile(path: string) {
        return await promises.readFile(path);
    }

    getDictionnaries() {
        return this.dictionnaries.map((dict) => ({ id: dict.id, name: dict.name } as DictionnaryInfo));
    }
    isValidWord(playedWord: string) {
        if (!this.isWord(playedWord)) {
            return false;
        }
        return this.dictionnaries[0].words.includes(playedWord.toLowerCase());
    }
    private isWord(expression: string): boolean {
        return expression.match(/[a-z]+/i) !== null;
    }
}
