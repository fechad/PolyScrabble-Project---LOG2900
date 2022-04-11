/* eslint-disable @typescript-eslint/no-magic-numbers, dot-notation*/

import { Difficulty, GameType, Parameters } from '@app/classes/parameters';
import { PlacementOption } from '@app/classes/placement-option';
import * as cst from '@app/constants';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { GameHistoryService } from '@app/services/game-history-service';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Container } from 'typedi';
import { Game } from './game';
import { Position } from './position';
import { Room } from './room';
import { VirtualPlayer } from './virtual-player';

describe('VirtualPlayer', () => {
    let game: Game;
    let vP: VirtualPlayer;
    let dictionnaryService: DictionnaryService;
    let gameHistory: GameHistoryService;
    let parameters: Parameters;
    let previousMathRandom: typeof Math.random;

    before(async () => {
        dictionnaryService = Container.get(DictionnaryService);
        await dictionnaryService.init();
        gameHistory = Container.get(GameHistoryService);
        await gameHistory.connect();
    });

    beforeEach(() => {
        parameters = new Parameters();
        parameters.timer = 60;
        parameters.dictionnary = 0;
        parameters.gameType = GameType.Solo;
        parameters.difficulty = Difficulty.Beginner;
        parameters.log2990 = false;
        const room = new Room(1, '1', 'Dummy', parameters);
        room.addPlayer('2', 'otherDummy', false, 'a');
        room.addPlayer(cst.AI_ID, 'heo', true, 'a');
        game = new Game(room, dictionnaryService, gameHistory);
        vP = new VirtualPlayer(Difficulty.Expert, game, dictionnaryService.dictionnaries[0].trie);
        previousMathRandom = Math.random;
    });

    afterEach(() => {
        Math.random = previousMathRandom;
    });

    it('playTurn should send a message v1', () => {
        Math.random = () => 0.0;
        vP['playTurn']();
    });
    it('playTurn should send a message v2', () => {
        Math.random = () => 0.1;
        vP['playTurn']();
    });
    it('playTurn should send a message v3', () => {
        Math.random = () => 0.1;
        vP['playTurn']();
    });

    it('should playturn when current turn is my turn', (done) => {
        Math.random = () => 0.1;
        vP['playTurn'] = sinon.stub();
        game.getCurrentPlayer().id = 'VP';
        vP.waitForTurn();
        const timeout = 1500;
        setTimeout(() => {
            expect((vP['playTurn'] as sinon.SinonStub).args).to.deep.equal([[]]);
            done();
        }, timeout);
    });

    it('should select a random bracket', () => {
        Math.random = () => 0.2;
        expect(vP['getRandomPointBracket']()).to.deep.equal(cst.LOWER_POINT_BRACKET);
        Math.random = () => 0.5;
        expect(vP['getRandomPointBracket']()).to.deep.equal(cst.MIDDLE_POINT_BRACKET);
        Math.random = () => 0.9;
        expect(vP['getRandomPointBracket']()).to.deep.equal(cst.HIGHER_POINT_BRACKET);
    });

    const testPrefixSuffix = (position: Position, prefix: string, toTest: string, suffix: string): boolean => {
        try {
            game.board.place([...prefix].map((letter, i) => ({ letter, position: position.withOffset(false, i - prefix.length) })));
            game.board.place([...suffix].map((letter, i) => ({ letter, position: position.withOffset(false, i + 1) })));
        } catch {
            /* Ignore if placement fails */
        }
        const node = vP['findPrefix'](position, false);
        return vP['validSuffix'](node, toTest.toUpperCase(), position, false);
    };

    it('should find prefixes/suffixes', () => {
        expect(testPrefixSuffix(new Position(3, 3), 'att', 'e', 'ntion')).to.equal(true);
    });

    it('should not find prefixes/suffixes when not terminal', () => {
        expect(testPrefixSuffix(new Position(3, 3), 'att', 'e', 'ntion')).to.equal(true);
    });

    it('should not find prefixes/suffixes when not valid word', () => {
        expect(testPrefixSuffix(new Position(3, 3), 'att', 'e', 'ntib')).to.equal(false);
    });

    it('should not find prefixes/suffixes when not in bound', () => {
        expect(testPrefixSuffix(new Position(14, 14), 'att', 'e', 'ntion')).to.equal(false);
    });

    it('should not find prefixes/suffixes when letter is impossible', () => {
        expect(testPrefixSuffix(new Position(3, 3), 'att', 'd', 'ntion')).to.equal(false);
    });

    it('should throw if prefix is not a valid word', () => {
        expect(() => testPrefixSuffix(new Position(3, 3), 'xxx', 'd', 'ntion')).to.throw();
    });

    it('should find replacement from previous replacements', () => {
        game.board.place([
            { letter: 'a', position: new Position(7, 6) },
            { letter: 's', position: new Position(7, 7) },
        ]);

        const availableLetters = [...'RZAAR'];

        const expectedReturn = [
            new PlacementOption(false, [{ letter: 'a', position: new Position(8, 7) }]),
            new PlacementOption(false, [
                { letter: 'a', position: new Position(8, 7) },
                { letter: 'r', position: new Position(9, 7) },
            ]),
            new PlacementOption(false, [
                { letter: 'a', position: new Position(8, 7) },
                { letter: 'r', position: new Position(9, 7) },
                { letter: 'a', position: new Position(10, 7) },
            ]),
            new PlacementOption(false, [{ letter: 'a', position: new Position(8, 6) }]),
            new PlacementOption(false, [
                { letter: 'r', position: new Position(8, 6) },
                { letter: 'a', position: new Position(9, 6) },
            ]),
            new PlacementOption(true, [{ letter: 'a', position: new Position(7, 8) }]),
            new PlacementOption(true, [{ letter: 'a', position: new Position(7, 5) }]),
            new PlacementOption(true, [{ letter: 'r', position: new Position(7, 5) }]),
            new PlacementOption(true, [
                { letter: 'r', position: new Position(7, 5) },
                { letter: 'a', position: new Position(7, 8) },
            ]),
            new PlacementOption(true, [
                { letter: 'a', position: new Position(7, 4) },
                { letter: 'r', position: new Position(7, 5) },
            ]),
            new PlacementOption(true, [
                { letter: 'a', position: new Position(7, 4) },
                { letter: 'r', position: new Position(7, 5) },
                { letter: 'a', position: new Position(7, 8) },
            ]),
            new PlacementOption(false, [{ letter: 'a', position: new Position(6, 7) }]),
            new PlacementOption(false, [
                { letter: 'a', position: new Position(6, 7) },
                { letter: 'a', position: new Position(8, 7) },
            ]),
            new PlacementOption(false, [{ letter: 'a', position: new Position(6, 6) }]),
            new PlacementOption(false, [{ letter: 'r', position: new Position(6, 6) }]),
            new PlacementOption(false, [
                { letter: 'r', position: new Position(6, 6) },
                { letter: 'z', position: new Position(8, 6) },
            ]),
            new PlacementOption(false, [
                { letter: 'a', position: new Position(5, 7) },
                { letter: 'a', position: new Position(6, 7) },
            ]),
            new PlacementOption(false, [
                { letter: 'a', position: new Position(5, 7) },
                { letter: 'r', position: new Position(6, 7) },
            ]),
            new PlacementOption(false, [
                { letter: 'r', position: new Position(5, 7) },
                { letter: 'a', position: new Position(6, 7) },
            ]),
            new PlacementOption(false, [
                { letter: 'r', position: new Position(5, 7) },
                { letter: 'a', position: new Position(6, 7) },
                { letter: 'a', position: new Position(8, 7) },
            ]),
            new PlacementOption(false, [
                { letter: 'a', position: new Position(5, 6) },
                { letter: 'r', position: new Position(6, 6) },
            ]),
            new PlacementOption(false, [
                { letter: 'a', position: new Position(4, 7) },
                { letter: 'r', position: new Position(5, 7) },
                { letter: 'a', position: new Position(6, 7) },
            ]),
        ];
        const result = vP['getPlayablePositions'](availableLetters);
        expect(result).to.deep.equal(expectedReturn);
    });

    it('should choose a word on 1st turn', () => {
        const result = vP.chooseWords([...'ABCDLO']);
        expect(result).to.not.equal(undefined);
        for (const placement of result) {
            expect(placement.placement.newLetters[0].position.row).to.equal(7);
            expect(placement.placement.newLetters[0].position.col).to.equal(7);
        }
    });

    it('should choose a word connected to words on board', () => {
        game.board.place([
            { letter: 'a', position: new Position(7, 6) },
            { letter: 's', position: new Position(7, 7) },
        ]);
        const rack = [...'ABCDLO'];
        const options = vP.chooseWords(rack);

        expect(options).to.not.equal(undefined);
        const possibleLetters = rack.concat([...'AS']);
        for (const option of options) {
            for (const letter of option.placement.newLetters) {
                expect(possibleLetters).to.include(letter.letter.toUpperCase());
            }
        }
    });

    it('test case 1', () => {
        game.board.place([
            { letter: 'L', position: new Position(1, 0) },
            { letter: 'N', position: new Position(2, 0) },
            { letter: 'O', position: new Position(2, 1) },
            { letter: 'D', position: new Position(2, 2) },
            { letter: 'A', position: new Position(2, 3) },
            { letter: 'L', position: new Position(2, 4) },
            { letter: 'E', position: new Position(2, 5) },
            { letter: 'N', position: new Position(3, 0) },
            { letter: 'O', position: new Position(3, 1) },
            { letter: 'N', position: new Position(3, 2) },
            { letter: 'E', position: new Position(3, 3) },
            { letter: 'S', position: new Position(3, 4) },
            { letter: 'U', position: new Position(3, 5) },
            { letter: 'A', position: new Position(4, 0) },
            { letter: 'V', position: new Position(4, 1) },
            { letter: 'E', position: new Position(4, 2) },
            { letter: 'R', position: new Position(4, 3) },
            { letter: 'S', position: new Position(4, 4) },
            { letter: 'R', position: new Position(5, 0) },
            { letter: 'I', position: new Position(5, 1) },
            { letter: 'T', position: new Position(6, 0) },
            { letter: 'K', position: new Position(7, 0) },
            { letter: 'A', position: new Position(7, 1) },
            { letter: 'N', position: new Position(7, 2) },
            { letter: 'I', position: new Position(8, 0) },
            { letter: 'I', position: new Position(8, 1) },
            { letter: 'P', position: new Position(9, 0) },
        ]);
        const rack = [...'JQTPUER'];
        const options = vP.chooseWords(rack);
        const wordGetter = game['wordGetter'];
        for (const option of options) {
            const words = wordGetter.getWords(option.placement);
            for (const word of words) {
                expect(dictionnaryService.isValidWord(0, word.word)).to.equal(true, `${word} is not a valid word`);
            }
        }
    });
});
