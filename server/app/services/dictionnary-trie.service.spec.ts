import { DictionnaryService } from '@app/services/dictionnary.service';
import { expect } from 'chai';
import { DictionnaryTrieService } from './dictionnary-trie.service';

describe('Dictionnary Trie', () => {
    let dictionnary: DictionnaryService;
    let dictionnaryTrieService: DictionnaryTrieService;
    before(async () => {
        dictionnary = new DictionnaryService();
        await dictionnary.init();
        dictionnaryTrieService = new DictionnaryTrieService(dictionnary);
    });
    it('should create tree', () => {
        expect(dictionnaryTrieService.dictionnaryTree.letter).to.equal('*');
    });
    it('should create all perm', () => {
        expect(dictionnaryTrieService.dictionnaryTree.letter).to.equal('*');
        const b = [...'rouejksaowpoqmnd'];
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        console.log(
            dictionnaryTrieService.generatePossibleWords(b, [
                { connectedLetter: 't', index: 3 },
                { connectedLetter: 's', index: 5 },
                { connectedLetter: undefined, index: 7 },
            ]),
        );
    });
});
