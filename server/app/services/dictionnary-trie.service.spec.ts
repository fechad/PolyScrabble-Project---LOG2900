/* eslint-disable @typescript-eslint/no-magic-numbers */
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
    it('should generate words that respect formatting', () => {
        expect(dictionnaryTrieService.dictionnaryTree.letter).to.equal('*');
        const b = [...'baeeudn'];
        const words = dictionnaryTrieService.generatePossibleWords(b, [
            { connectedLetter: 's', index: 2 },
            { connectedLetter: undefined, index: 4 },
        ]);
        expect(words.every((word) => word[2] === 's')).to.equal(true);
        expect(words.every((word) => word.length <= 4 && word.length >= 3)).to.equal(true);
    });
});
