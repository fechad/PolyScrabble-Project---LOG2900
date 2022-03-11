import { LetterNode } from '@app/classes/letter-node';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { Service } from 'typedi';

@Service()
export class DictionnaryTrieService {
    dictionnaryTree: LetterNode = new LetterNode('*');
    constructor(private dictionnary: DictionnaryService) {
        for (const word of this.dictionnary.dictionnaries[0].words) {
            let actualNode = this.dictionnaryTree;
            [...word].forEach((letter, i) => {
                actualNode = actualNode.getNext(letter);
                if (i === word.length - 1) actualNode.final = true;
            });
        }
    }
}
