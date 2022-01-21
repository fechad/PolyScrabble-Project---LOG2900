import { expect } from 'chai';
import { Difficulty, GameType, Parameters } from './parameters';

describe('Parameters', () => {
    let parameters: Parameters;

    beforeEach(async () => {
        parameters = new Parameters();
    });

    it('should have default parameters', () => {
        expect(parameters.timer).to.equal(30);
        expect(parameters.gameType).to.equal(GameType.Multiplayer);
        expect(parameters.dictionnary).to.equal(0);
        expect(parameters.difficulty).to.equal(undefined);
        expect(parameters.validateParameters()).to.be.undefined;
    });

    it('should change parameters', () =>{
        parameters.timer = 60;
        expect(parameters.validateParameters()).to.be.undefined;
    });

    it('should return error on out of bound timer', ()=>{
        parameters.timer = -30;
        expect(parameters.validateParameters()).to.not.be.undefined;
        parameters.timer = 0;
        expect(parameters.validateParameters()).to.not.be.undefined;
        parameters.timer = 630;
        expect(parameters.validateParameters()).to.not.be.undefined;
    });

    it('should return error on wrong timer interval', ()=>{
        parameters.timer = 45;
        expect(parameters.validateParameters()).to.not.be.undefined;
        ;
    });

    it('should assign difficulty', ()=>{
        parameters.gameType = GameType.Solo;
        parameters.difficulty = Difficulty.Expert;
        expect(parameters.validateParameters()).to.be.undefined;
        ;
    });

    it('should not let solo game without difficulty', ()=>{
        parameters.gameType = GameType.Solo;
        expect(parameters.validateParameters()).to.not.be.undefined;
    });

    //TODO: test dictionnary ID existing when functionnality is done
});
