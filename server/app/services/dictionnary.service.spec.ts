import { DictionnaryService } from '@app/services/dictionnary.service';
import { assert } from 'chai';

describe('Dictionnary service', () => {
    let dictionnaryService: DictionnaryService;

    beforeEach(async () => {
        dictionnaryService = new DictionnaryService();
    });
    it('should be created', (done) => {
        assert(dictionnaryService !== undefined);
        done();
    });
    it('should have dictionnaries', async (done) => {
        assert(dictionnaryService.getDictionnaries().length > 0);
        done();
    });
});
