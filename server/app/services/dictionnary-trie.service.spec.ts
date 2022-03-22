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
    it('should validate correct branchings only', () => {
        expect(dictionnaryTrieService.isValidBranching([...'mart'])).to.equal(true);
        expect(dictionnaryTrieService.isValidBranching([...'marteau'])).to.equal(true);
        expect(dictionnaryTrieService.isValidBranching([...'cxb'])).to.equal(false);
    });
    it('should validation correct words only', () => {
        expect(dictionnaryTrieService.isValidBranching([...'mart'], true)).to.equal(false);
        expect(dictionnaryTrieService.isValidBranching([...'marteau'], true)).to.equal(true);
    });
    it('should generate words that respect formatting', () => {
        const rack = [...'baeeudn'];
        const words = dictionnaryTrieService.generatePossibleWords(rack, [
            { connectedLetter: 's', index: 2, isOnBoard: true },
            { connectedLetter: undefined, index: 4, isOnBoard: true },
        ]);
        expect(words.every((word) => word[2] === 's')).to.equal(true);
        expect(words.every((word) => word.length <= 4 && word.length >= 3)).to.equal(true);
    });
    it('should generate words from rack', () => {
        const rack = [...'salutd'];
        const words = dictionnaryTrieService.generatePossibleWords(rack, [
            { connectedLetter: '', index: 0, isOnBoard: true },
            { connectedLetter: undefined, index: 4, isOnBoard: true },
        ]);
        console.log(words);
    });
});
