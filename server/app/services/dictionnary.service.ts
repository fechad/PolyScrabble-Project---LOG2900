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

    isValidWord(playedWord: string) {
        if (!this.isWord(playedWord)) {
            return false;
        }
        console.log(playedWord);
        return this.dictionnaries[0].words.includes(playedWord.toLowerCase());
    }

    validateWords(wordList: string[]): boolean {
        let isValid = true;
        let valid: boolean;
        for(let word of wordList){
            let separatedWord = word.split(';');
            valid = this.isValidWord(separatedWord[separatedWord.length - 1]);
            if(!valid){
                isValid = false;
            }
        }
        console.log(isValid);
        return isValid;
    }

    private isWord(expression: string): boolean {
        return expression.match(/[a-z]+/i) !== null;
    }
}
