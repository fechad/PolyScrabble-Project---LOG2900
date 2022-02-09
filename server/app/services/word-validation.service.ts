import { DictionnaryService } from './dictionnary.service';

export class WordValidation {
    constructor(private dictionnaries: DictionnaryService) {
        dictionnaries.init();
    }

    isWord(expression: string): boolean {
        return expression.match(/[a-z]+/i) !== null;
    }

    isValid(playedWord: string) {
        if (!this.isWord(playedWord)) {
            return false;
        }
        return this.dictionnaries.getDictionnaries()[0].words.includes(playedWord);
    }
}
