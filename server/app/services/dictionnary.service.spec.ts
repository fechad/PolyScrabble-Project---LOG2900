import { DictionnaryService } from '@app/services/dictionnary.service';
import { assert } from 'chai';
import { Container } from 'typedi';

describe('Dictionnary service', () => {
    let dictionnaryService: DictionnaryService;

    before(async () => {
        dictionnaryService = Container.get(DictionnaryService);
        await dictionnaryService.init();
    });
    it('should be created', (done) => {
        assert(dictionnaryService !== undefined);
        done();
    });
    it('should have dictionnaries', async (done) => {
        const dictionary = dictionnaryService.getDictionnaries();
        assert(dictionary.length > 0);
        done();
    });
    it('should validate correct words', (done) => {
        assert(dictionnaryService.isValidWord(0, 'zythums'));
        assert(dictionnaryService.isValidWord(0, 'bonjour'));
        assert(dictionnaryService.isValidWord(0, 'passant'));
        done();
    });

    it('should accept upper case correct words', (done) => {
        assert(dictionnaryService.isValidWord(0, 'Zythums'));
        assert(dictionnaryService.isValidWord(0, 'zyTHUMs'));
        assert(dictionnaryService.isValidWord(0, 'ZYTHUMS'));
        done();
    });

    it('should invalidate incorrect words', (done) => {
        assert(!dictionnaryService.isValidWord(0, 'eyeneeks'));
        assert(!dictionnaryService.isValidWord(0, 'jdjd'));
        assert(!dictionnaryService.isValidWord(0, 'kklkam'));
        done();
    });
    it('should invalidate incorrect expressions', (done) => {
        assert(!dictionnaryService.isValidWord(0, '//'));
        assert(!dictionnaryService.isValidWord(0, '(90ms)'));
        assert(!dictionnaryService.isValidWord(0, '*@$^'));
        done();
    });
    it('should validate a list of words', (done) => {
        const wordList = ['v;6;5;test', 'h;12;8;valide', 'v;2;10;zythums'];
        const result = dictionnaryService.validateWords(0, wordList);
        assert(result);
        done();
    });
    it('should invalidate a list of wrong words', (done) => {
        const wordList = ['v;6;5;test', 'h;12;8;valide', 'v;2;10;zynnjsdc'];
        const result = dictionnaryService.validateWords(0, wordList);
        assert(!result);
        done();
    });
});
