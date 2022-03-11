import { DictionnaryService } from '@app/services/dictionnary.service';
import { expect } from 'chai';
import { DictionnaryTree } from './dictionary-tree';

describe('Dictionnary Tree', () => {
    let dictionnary: DictionnaryService;
    let dictionnaryTree: DictionnaryTree;
    before(async () => {
        dictionnary = new DictionnaryService();
        await dictionnary.init();
        dictionnaryTree = new DictionnaryTree(dictionnary);
    });
    it('should create tree', () => {
        expect(dictionnaryTree.dictionnaryTree.value).to.equal('*');
    });
});
