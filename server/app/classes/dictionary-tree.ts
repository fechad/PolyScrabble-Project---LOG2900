import { DictionnaryService } from '@app/services/dictionnary.service';
import { LetterNode } from './letter-node';

export class DictionnaryTree {
    dictionnaryTree: LetterNode = new LetterNode('*');
    constructor(private dictionnary: DictionnaryService) {
        for (const word of this.dictionnary.dictionnaries[0].words) {
            let actualNode = this.dictionnaryTree;
            console.log(word);
            for (let i = 0; i < word.length; i++) {
                const letter = word[i];
                actualNode = actualNode.getNext(letter);
                if (i === word.length - 1) actualNode.final = true;
            }
        }
    }
}
