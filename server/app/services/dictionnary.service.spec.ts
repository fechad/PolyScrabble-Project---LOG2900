import { DictionnaryService } from '@app/services/dictionnary.service';
import { assert } from 'chai';

describe('Dictionnary service', () => {
    let dictionnaryService: DictionnaryService;

    beforeEach(async () => {
        dictionnaryService = new DictionnaryService();
        await dictionnaryService.init();
    });
    it('should be created', (done) => {
        assert(dictionnaryService !== undefined);
        done();
    });
    it('should have dictionnaries', (done) => {
        assert(dictionnaryService.getDictionnaries().length > 0);
        done();
    });
    it('should validate correct words', (done) => {
        assert(dictionnaryService.isValidWord('zythums'));
        assert(dictionnaryService.isValidWord('bonjour'));
        assert(dictionnaryService.isValidWord('passant'));
        done();
    });

    it('should accept upper case correct words', (done) => {
        assert(dictionnaryService.isValidWord('Zythums'));
        assert(dictionnaryService.isValidWord('zyTHUMs'));
        assert(dictionnaryService.isValidWord('ZYTHUMS'));
        done();
    });

    it('should invalidate incorrect words', (done) => {
        assert(!dictionnaryService.isValidWord('eyeneeks'));
        assert(!dictionnaryService.isValidWord('jdjd'));
        assert(!dictionnaryService.isValidWord('kklkam'));
        done();
    });
    it('should invalidate incorrect expressions', (done) => {
        assert(!dictionnaryService.isValidWord('//'));
        assert(!dictionnaryService.isValidWord('(90ms)'));
        assert(!dictionnaryService.isValidWord('*@$^'));
        done();
    });
});
