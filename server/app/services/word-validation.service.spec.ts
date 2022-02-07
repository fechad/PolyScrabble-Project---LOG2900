import { expect } from 'chai';
import { WordValidation } from './word-validation.service';

describe('Word Validation', () => {
    const timeout = 5000; // ms
    let service: WordValidation;

    beforeEach(() => {
        service = new WordValidation();
    });

    it('should wait for words to be populated', async (done) => {
        service.words.then((words) => {
            const serviceTest = new WordValidation();
            serviceTest.words.then((wordsTest) => {
                expect(words).to.equal(wordsTest);
            });
        });
        done();
    }).timeout(timeout);

    it('should validate correct words', async (done) => {
        service.isValid('zythums').then((valid) => {
            expect(valid).to.equal(true);
        });
        service.isValid('bonjour').then((valid) => {
            expect(valid).to.equal(true);
        });
        service.isValid('passant').then((valid) => {
            expect(valid).to.equal(true);
        });
        done();
    }).timeout(timeout);

    it('should refuse incorrect words', async (done) => {
        service.isValid('jsjs').then((valid) => {
            expect(valid).to.equal(false);
        });
        service.isValid('vbonjour').then((valid) => {
            expect(valid).to.equal(false);
        });
        service.isValid('oowow').then((valid) => {
            expect(valid).to.equal(false);
        });
        done();
    }).timeout(timeout);

    it('should refuse expression with wrong characters', async (done) => {
        service.isValid('**387').then((valid) => {
            expect(valid).to.equal(false);
        });
        service.isValid(')(').then((valid) => {
            expect(valid).to.equal(false);
        });
        service.isValid('bonjour*').then((valid) => {
            expect(valid).to.equal(false);
        });
        done();
    }).timeout(timeout);
});
