import { promises } from 'fs';
import { Service } from 'typedi';

export type Dictionnary = { id: number; name: string; words: string[] };
export type DictionnaryInfo = { id: number; name: string; words: string[] };

@Service()
export class DictionnaryService {
    private dictionnaries: Dictionnary[] = [];

    async init() {
        const fileBuffer = await promises.readFile('./assets/dictionnary.json');
        const readDicitonnary = JSON.parse(fileBuffer.toString());
        this.dictionnaries.push({ id: 0, name: 'français', words: readDicitonnary.words });
    }

    getDictionnaries() {
        return this.dictionnaries.map((dict) => ({ id: dict.id, name: dict.name } as DictionnaryInfo));
    }

    // TODO: valider au moins 2 lettres
    isValidWord(playedWord: string) {
        if (!this.isWord(playedWord)) {
            return false;
        }
        return this.dictionnaries[0].words.includes(playedWord.toLowerCase());
    }

    validateWords(wordList: string[]): boolean {
        return wordList.map((word) => word.split(';')).every((words) => this.isValidWord(words[words.length - 1]));
    }

    private isWord(expression: string): boolean {
        return expression.match(/[a-z]+/i) !== null;
    }
}
