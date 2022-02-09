import { DictionnaryService } from './dictionnary.service';

export class WordValidation {
    constructor(private dictionnaries: DictionnaryService) {}

    isWord(expression: string): boolean {
        return expression.match(/[a-z]+/i) !== null;
    }

    async isValid(playedWord: string): Promise<boolean> {
        if (!this.isWord(playedWord)) {
            return false;
        }
        return (await this.dictionnaries[0]).words.has(playedWord);
    }
}
