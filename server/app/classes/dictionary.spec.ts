import { assert } from 'chai';
import { Dictionnary } from './dictionary';

describe('Dictionary service', () => {
    let dictionnary: Dictionnary;

    before(async () => {
        dictionnary = new Dictionnary(0, 'example', '', ['zythums', 'bonjour', 'passant'], 'filename.json');
    });
    it('should validate correct words', () => {
        assert(dictionnary.isValidWord('zythums'));
        assert(dictionnary.isValidWord('bonjour'));
        assert(dictionnary.isValidWord('passant'));
    });

    it('should accept upper case correct words', () => {
        assert(dictionnary.isValidWord('Zythums'));
        assert(dictionnary.isValidWord('zyTHUMs'));
        assert(dictionnary.isValidWord('ZYTHUMS'));
    });

    it('should invalidate incorrect words', () => {
        assert(!dictionnary.isValidWord('eyeneeks'));
        assert(!dictionnary.isValidWord('jdjd'));
        assert(!dictionnary.isValidWord('kklkam'));
    });
    it('should invalidate incorrect expressions', () => {
        assert(!dictionnary.isValidWord('//'));
        assert(!dictionnary.isValidWord('(90ms)'));
        assert(!dictionnary.isValidWord('*@$^'));
    });
});
