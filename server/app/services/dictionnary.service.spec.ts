import { Dictionnary } from '@app/classes/dictionary';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { Container } from 'typedi';

describe('Dictionnary service', () => {
    let dictionnaryService: DictionnaryService;
    let sandbox: sinon.SinonSandbox;
    let writeStub: sinon.SinonStub;
    let unlinkStub: sinon.SinonStub;

    before(async () => {
        dictionnaryService = Container.get(DictionnaryService);
    });

    beforeEach(async () => {
        sandbox = sinon.createSandbox();
        writeStub = sandbox.stub(fs.promises, 'writeFile').returns(Promise.resolve());
        unlinkStub = sandbox.stub(fs.promises, 'unlink').returns(Promise.resolve());

        // eslint-disable-next-line dot-notation
        dictionnaryService['dictionnaries'].splice(0);
        // eslint-disable-next-line dot-notation
        dictionnaryService['nextId'] = 1;
        // eslint-disable-next-line dot-notation
        dictionnaryService['dictionnaries'].push(new Dictionnary(0, 'Hello', 'Desc', ['aa', 'bb', 'cc'], './assets/dictionnary.json'));
    });
    afterEach(async () => {
        sandbox.restore();
    });

    it('should be created', () => {
        expect(dictionnaryService).not.to.equal(undefined);
    });
    it('should have dictionnaries', async () => {
        const dictionary = dictionnaryService.getDictionnaries();
        expect(dictionary.length).to.be.greaterThan(0);
    });

    it('should read dictionnaries', async () => {
        // eslint-disable-next-line dot-notation
        dictionnaryService['dictionnaries'].splice(0);
        // eslint-disable-next-line dot-notation
        dictionnaryService['nextId'] = 0;
        sandbox.stub(fs.promises, 'readdir').returns(Promise.resolve(['aaa-1.json'] as unknown as fs.Dirent[]));
        sandbox
            .stub(fs.promises, 'readFile')
            .callsFake(async (file) => Promise.resolve(Buffer.from(`{"title":"Hello ${file}", "description":"Desc", "words": ["aa", "bb", "cc"]}`)));
        await dictionnaryService.init();
        // eslint-disable-next-line dot-notation
        expect(dictionnaryService['dictionnaries']).to.deep.equal([
            new Dictionnary(0, 'Hello ./assets/dictionnary.json', 'Desc', ['aa', 'bb', 'cc'], './assets/dictionnary.json'),
            new Dictionnary(1, 'Hello ./dictionaries/aaa-1.json', 'Desc', ['aa', 'bb', 'cc'], './dictionaries/aaa-1.json'),
        ]);
    });

    it('should add dictionary', async () => {
        await dictionnaryService.add('dummy', 'def', ['d', 'e', 'f']);
        expect(dictionnaryService.getDictionnaries()).to.deep.equal([
            { id: 0, title: 'Hello', description: 'Desc' },
            { id: 1, title: 'dummy', description: 'def' },
        ]);
        expect(writeStub.callCount).to.equal(1);
    });

    it('should update dictionary', async () => {
        sandbox.stub(dictionnaryService, 'writeDict' as never).returns(Promise.resolve());
        await dictionnaryService.update(0, 'dumdum', 'def');
        expect(dictionnaryService.getDictionnaries()).to.deep.equal([{ id: 0, title: 'dumdum', description: 'def' }]);
    });

    it('should delete dictionary', async () => {
        await dictionnaryService.add('dummy', 'def', ['d', 'e', 'f']);
        await dictionnaryService.delete(1);
        expect(dictionnaryService.getDictionnaries()).to.deep.equal([{ id: 0, title: 'Hello', description: 'Desc' }]);
        expect(unlinkStub.called).to.equal(true);
    });

    it('should edit dictionary File', async () => {
        // eslint-disable-next-line dot-notation
        await dictionnaryService['writeDict'](new Dictionnary(1, 'dummy', 'description', ['aa', 'bb', 'cc'], 'file.json'));
        expect(writeStub.args).to.deep.equal([
            ['file.json', JSON.stringify({ title: 'dummy', description: 'description', words: ['aa', 'bb', 'cc'] })],
        ]);
    });

    it('should delete all dictionaries except default one', async () => {
        await dictionnaryService.add('dummy', 'def', ['d', 'e', 'f']);
        await dictionnaryService.add('dummy2', 'def', ['d', 'e', 'f']);
        await dictionnaryService.add('dummy3', 'def', ['d', 'e', 'f']);
        await dictionnaryService.deleteAll();
        expect(dictionnaryService.getDictionnaries()).to.have.lengthOf(1);
        expect(unlinkStub.callCount).to.equal(3);
    });
});
