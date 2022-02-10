import { Application } from '@app/app';
import { DictionnaryInfo, DictionnaryService } from '@app/services/dictionnary.service';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('DictionnaryController', () => {
    const dictionnaries = [{ id: 0, name: 'français', words: ['a', 'b', 'c'] }] as DictionnaryInfo[];
    let dictionnaryService: SinonStubbedInstance<DictionnaryService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        dictionnaryService = createStubInstance(DictionnaryService);
        dictionnaryService.getDictionnaries.returns(dictionnaries);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['httpController'], 'dictionnaryService', { value: dictionnaryService });
        expressApp = app.app;
    });

    it('should return dictionnaries on request to /dictionnaries', async () => {
        return supertest(expressApp)
            .get('/api/dictionnaries')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(dictionnaries);
            });
    });
});
