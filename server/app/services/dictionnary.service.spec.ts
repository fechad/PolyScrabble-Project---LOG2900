import { Dictionnary } from '@app/classes/dictionary';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { Container } from 'typedi';

describe('Dictionnary service', () => {
    let dictionnaryService: DictionnaryService;
    let sandbox: sinon.SinonSandbox;
    beforeEach(async () => { sandbox = sinon.createSandbox(); });
    afterEach(async () => sandbox.restore());

    before(async () => {
        dictionnaryService = Container.get(DictionnaryService);
        await dictionnaryService.init();
    });
    it('should be created', () => {
        expect(dictionnaryService).not.to.equal(undefined);
    });
    it('should have dictionnaries', async () => {
        const dictionary = dictionnaryService.getDictionnaries();
        expect(dictionary.length).to.be.greaterThan(0);
    });

    it('should read dictionnaries', async () => {
        const sandbox = sinon.createSandbox();
        // eslint-disable-next-line dot-notation
        dictionnaryService['dictionnaries'].splice(0);
        sandbox.stub(fs.promises, 'readdir').returns(
                Promise.resolve(['aaa-1.json'] as unknown as fs.Dirent[]),
        );
        sandbox.stub(fs.promises, 'readFile').returns(
            Promise.resolve(Buffer.from('{"title":"Hello", "description":"Desc", "words": ["aa", "bb", "cc"]}')),
        );
        await dictionnaryService.init();
        // eslint-disable-next-line dot-notation
        expect(dictionnaryService['dictionnaries']).to.deep.equal([new Dictionnary(0, "Hello", "Desc", ["aa", "bb", "cc"], './assets/dictionnary.json'), new Dictionnary(1, "Hello", "Desc", ["aa", "bb", "cc"], './dictionaries/aaa-1.json')]);
    });


    // TODO
    /*
    it('should add dictionary', async () => {
        const stub = sandbox.stub(fs.promises, 'writeFile').returns(Promise.resolve());
        dictionnaryService.add('dummy', 'def', ['d', 'e', 'f']);
        expect(await dictionnaryService.getDictionnaries()).to.deep.equal([
            { id: 0, title: 'dummy', description: 'abc' },
            { id: 1, title: 'dummy', description: 'def' },
        ]);
        expect(stub.callCount).to.equal(1);
    });

    it('should update dictionary', async () => {
        sandbox.stub(dbDictionariesService, 'editFile').returns(Promise.resolve());
        const oldDictionary: DbDictionary = { id: 0, title: 'dummy', description: 'abc', words: ['a', 'b', 'c'] };
        const newDictionary: DbDictionary = { id: 0, title: 'dumdum', description: 'def', words: ['d', 'e', 'f'] };
        const newUpdate: DictPair = { oldDictionary, newDictionary };
        await dbDictionariesService.updateDictionary(newUpdate);
        expect(await dbDictionariesService.getDictionaries()).to.deep.equal([{ id: 0, title: 'dumdum', description: 'def' }]);
    });

    it('should delete dictionary', async () => {
        sinon.stub(dbDictionariesService, 'syncDictionaries').returns(Promise.resolve());
        const id = '0';
        dbDictionariesService.deleteDictionary(id);
        expect(await dbDictionariesService.getDictionaries()).to.deep.equal([]);
    });

    it('should remove dictionary File', async () => {
        const stub = sandbox.stub(fs.promises, 'unlink').returns(Promise.resolve());
        const fileId = 1;
        await dbDictionariesService.removeDictionaryFile(fileId);
        expect(stub.called).to.equal(true);
    });

    it('should download dictionary File', async () => {
        const fileId = '0';
        let downloadLink = '';
        sinon.stub(fs.promises, 'access').returns(
            new Promise((resolve) => {
                downloadLink = `./dictionaries/dictionary-${fileId}.json`;
                resolve();
            }),
        );
        await dbDictionariesService.downloadDictionary(fileId);
        expect(downloadLink).to.equal(`./dictionaries/dictionary-${fileId}.json`);
    });

    it('should remove dictionary File when sync function is called and dictionary not available in database', async () => {
        const unlink = sandbox.stub(fs.promises, 'unlink').returns(Promise.resolve());
        const availableFiles = [0, 1];
        sandbox.stub(fs.promises, 'readdir').callsFake(async () => {
            for (const file of availableFiles) await dbDictionariesService.removeDictionaryFile(file);
            return [];
        });
        await dbDictionariesService.syncDictionaries();
        expect(unlink.called).to.equal(true);
    });

    it('should edit dictionary File', async () => {
        let file = ['abc', 'dummy'];
        const oldDictionary: DbDictionary = { id: 0, title: 'dummy', description: 'abc', words: ['a', 'b', 'c'] };
        const newDictionary: DbDictionary = { id: 0, title: 'dumdum', description: 'def', words: ['d', 'e', 'f'] };
        const newUpdate: DictPair = { oldDictionary, newDictionary };

        sandbox.stub(fs.promises, 'readFile').returns(
            new Promise((resolve) => {
                file = ['def', 'dumdum'];
                resolve(file[0]);
            }),
        );
        sandbox.stub(fs.promises, 'writeFile').returns(
            new Promise((resolve) => {
                file = ['def', 'dumdum'];
                resolve();
            }),
        );

        await dbDictionariesService.editFile(newUpdate);
        expect(file).to.deep.equal(['def', 'dumdum']);
    });

    it('should delete all dictionaries except default one', async () => {
        sinon.stub(dbDictionariesService, 'syncDictionaries').returns(Promise.resolve());
        dbDictionariesService.deleteAll();
        expect(await dbDictionariesService.getDictionaries()).to.have.lengthOf(1);
    });
    */
});
