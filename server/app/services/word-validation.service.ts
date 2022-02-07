import { readFile } from 'fs';

export class WordValidation {
    words: Promise<Set<string>>;
    constructor() {
        this.words = new Promise((resolve) => {
            readFile('./assets/dictionnary.json', (data) => {
                const dictionnarySet: Set<string> = new Set<string>();
                if (data !== null) {
                    for (const dictionnaryWord of JSON.parse(data.toString()).words) {
                        dictionnarySet.add(dictionnaryWord);
                    }
                }
                resolve(dictionnarySet);
            });
        });
    }

    isWord(expression: string): boolean {
        return expression.match(/[a-z]+/i) !== null;
    }

    async isValid(playedWord: string): Promise<boolean> {
        if (!this.isWord(playedWord)) {
            return false;
        }
        return (await this.words).has(playedWord);
    }
}
