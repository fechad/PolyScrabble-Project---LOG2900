import { assert, expect } from 'chai';
import { SyntaxValidator } from './syntax-validator';

describe('syntax validator', () => {
    let validator: SyntaxValidator;

    beforeEach(() => {
        validator = new SyntaxValidator();
    });

    it('should separate the position of the word placement', (done) => {
        let positionArrayExpected = ['a', '7', 'h'];
        let position = 'a7h';

        let positionResult = validator.separatePosition(position);
        expect(positionResult[0]).to.be.equal(positionArrayExpected[0]);
        expect(positionResult[1]).to.be.equal(positionArrayExpected[1]);
        expect(positionResult[2]).to.be.equal(positionArrayExpected[2]);

        positionArrayExpected = ['o', '15', 'v'];
        position = 'o15v';
        positionResult = validator.separatePosition(position);
        expect(positionResult[0]).to.be.equal(positionArrayExpected[0]);
        expect(positionResult[1]).to.be.equal(positionArrayExpected[1]);
        expect(positionResult[2]).to.be.equal(positionArrayExpected[2]);
        done();
    });

    it('should validate valid positions', (done) => {
        let positionArray = ['g', '12', 'h'];
        let result = validator.validatePositionSyntax(positionArray);
        assert(result);

        positionArray = ['c', '9', 'v'];
        result = validator.validatePositionSyntax(positionArray);
        assert(result);
        done();
    });

    it('should not let positions out of bound or invalid orientation in the string', (done) => {
        let positionArray = ['v', '12', 'h'];
        let result = validator.validatePositionSyntax(positionArray);
        assert(!result);

        positionArray = ['c', '18', 'v'];
        result = validator.validatePositionSyntax(positionArray);
        assert(!result);

        positionArray = ['e', '9', 'k'];
        result = validator.validatePositionSyntax(positionArray);
        assert(!result);
        done();
    });
    
});
