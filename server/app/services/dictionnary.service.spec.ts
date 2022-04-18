import { DictionnaryService } from '@app/services/dictionnary.service';
import { assert, expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { Container } from 'typedi';

describe('Dictionnary service', () => {
    let dictionnaryService: DictionnaryService;
    before(async () => {
        dictionnaryService = Container.get(DictionnaryService);
        await dictionnaryService.init();
    });

    it('should be created', () => {
        expect(dictionnaryService).to.not.equal(undefined);
    });

    it('should have dictionnaries', async () => {
        assert(dictionnaryService.getDictionnaries().length > 0);
    });

    it('should copy dictionary in file', async () => {
        const sandbox = sinon.createSandbox();
        sandbox.stub(fs.promises, 'readdir').returns(
            new Promise((resolve) => {
                const file = ['aaa-1'] as unknown as fs.Dirent[];
                resolve(file);
            }),
        );
        sandbox.stub(fs.promises, 'readFile').returns(
            new Promise((resolve) => {
                const file = 'aa-1';
                resolve(file);
            }),
        );
        const dict = { id: 0, title: 'francais', words: ['a', 'b'] };
        sandbox.stub(JSON, 'parse').callsFake(() => {
            return dict;
        });

        await dictionnaryService.copyDictionaries();
        expect(dictionnaryService.dictionnaries[1].words.size).to.equal(dict.words.length);
    });
});
