import { DictionnaryService } from '@app/services/dictionnary.service';
import { assert, expect } from 'chai';
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
    it('should have dictionnaries', () => {
        assert(dictionnaryService.getDictionnaries().length > 0);
    });
});
