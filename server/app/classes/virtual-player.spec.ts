/* eslint-disable @typescript-eslint/no-magic-numbers, dot-notation*/

import { Difficulty, GameType, Parameters } from '@app/classes/parameters';
import { PlacementOption } from '@app/classes/placement-option';
import { AI_ID } from '@app/constants';
import { DictionnaryService } from '@app/services/dictionnary.service';
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
    let parameters: Parameters;

    before(async () => {
        dictionnaryService = Container.get(DictionnaryService);
        await dictionnaryService.init();
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
        room.addPlayer(AI_ID, 'heo', true, 'a');
        game = new Game(room, dictionnaryService);
        vP = new VirtualPlayer(Difficulty.Expert, game, dictionnaryService.dictionnaries[0].trie);
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

    /* it('should get playable positions with valid crosswords', () => {
        game.board.place([
            { letter: 'a', position: new Position(0, 0) },
            { letter: 's', position: new Position(0, 1) },
        ]);

        const expectedOptions: [PlacementOption, number][] = [
            { row: 0, col: 2, isHorizontal: true, word: 'as       ', score: 0, command: '' },
            { row: 0, col: 2, isHorizontal: false, word: 'A      ', score: 0, command: '' },
            { row: 1, col: 0, isHorizontal: true, word: 'A', score: 0, command: '' },
            { row: 1, col: 0, isHorizontal: false, word: 'a       ', score: 0, command: '' },
            { row: 1, col: 1, isHorizontal: true, word: 'A      ', score: 0, command: '' },
            { row: 1, col: 1, isHorizontal: false, word: 's       ', score: 0, command: '' },
        ];
        const result = vP.chooseWords([...'ARZW']);
        expect(result).to.deep.equal(expectedOptions);
    });

    it('should validate explored options from tried placements', () => {
        game.board.place([
            { letter: 'a', position: new Position(0, 0) },
            { letter: 's', position: new Position(0, 1) },
        ]);
        const letterA: Letter = { id: 0, name: 'A', score: 1, quantity: 1 };
        const letterR: Letter = { id: 0, name: 'R', score: 1, quantity: 1 };
        const letterZ: Letter = { id: 0, name: 'Z', score: 1, quantity: 1 };
        game.reserve.letterRacks[1] = [letterA, letterR, letterZ];
        const placementOptions = [
            new PlacementOption(0, 2, true, 'as       '),
            new PlacementOption(0, 2, false, '#      '),
            new PlacementOption(1, 0, true, '##     '),
            new PlacementOption(1, 0, false, 'a       '),
            new PlacementOption(1, 1, true, '#      '),
            new PlacementOption(1, 1, false, 's       '),
        ];
        const exploredOptions: PlacementOption[] = [new PlacementOption(7, 7, true, 'Z')];

        const expectedExploredOptions = [
            new PlacementOption(7, 7, true, 'Z'),
            new PlacementOption(0, 2, false, 'A'),
            new PlacementOption(1, 0, true, 'A'),
            new PlacementOption(1, 1, true, 'A'),
        ];
        const expectedValidOptions = [
            new PlacementOption(0, 2, true, 'as       '),
            new PlacementOption(0, 2, false, 'A      '),
            new PlacementOption(1, 0, true, 'A'),
            new PlacementOption(1, 0, false, 'a       '),
            new PlacementOption(1, 1, true, 'A      '),
            new PlacementOption(1, 1, false, 's       '),
        ];
        const result = vP['validateCrosswords'](placementOptions, exploredOptions);
        expect(exploredOptions).to.deep.equal(expectedExploredOptions);
        expect(result).to.deep.equal(expectedValidOptions);
    });*/

    it('should find replacement from previous replacements', () => {
        game.board.place([
            { letter: 'a', position: new Position(7, 6) },
            { letter: 's', position: new Position(7, 7) },
        ]);

        const availableLetters = [...'RZAAR'];

        const expectedReturn = [
            new PlacementOption(false, [{ letter: 'A', position: new Position(8, 7) }]),
            new PlacementOption(false, [
                { letter: 'A', position: new Position(8, 7) },
                { letter: 'R', position: new Position(9, 7) },
            ]),
            new PlacementOption(false, [
                { letter: 'A', position: new Position(8, 7) },
                { letter: 'R', position: new Position(9, 7) },
                { letter: 'A', position: new Position(10, 7) },
            ]),
            new PlacementOption(false, [{ letter: 'A', position: new Position(8, 6) }]),
            new PlacementOption(false, [
                { letter: 'R', position: new Position(8, 6) },
                { letter: 'A', position: new Position(9, 6) },
            ]),
            new PlacementOption(true, [{ letter: 'A', position: new Position(7, 8) }]),
            new PlacementOption(true, [{ letter: 'A', position: new Position(7, 5) }]),
            new PlacementOption(true, [{ letter: 'R', position: new Position(7, 5) }]),
            new PlacementOption(true, [
                { letter: 'R', position: new Position(7, 5) },
                { letter: 'A', position: new Position(7, 8) },
            ]),

            new PlacementOption(true, [
                { letter: 'A', position: new Position(7, 4) },
                { letter: 'R', position: new Position(7, 5) },
            ]),
            new PlacementOption(true, [
                { letter: 'A', position: new Position(7, 4) },
                { letter: 'R', position: new Position(7, 5) },
                { letter: 'A', position: new Position(7, 8) },
            ]),
            new PlacementOption(false, [{ letter: 'A', position: new Position(6, 7) }]),
            new PlacementOption(false, [
                { letter: 'A', position: new Position(6, 7) },
                { letter: 'A', position: new Position(8, 7) },
            ]),
            new PlacementOption(false, [{ letter: 'A', position: new Position(6, 6) }]),
            new PlacementOption(false, [{ letter: 'R', position: new Position(6, 6) }]),
            new PlacementOption(false, [
                { letter: 'R', position: new Position(6, 6) },
                { letter: 'Z', position: new Position(8, 6) },
            ]),
            new PlacementOption(false, [
                { letter: 'A', position: new Position(5, 7) },
                { letter: 'A', position: new Position(6, 7) },
            ]),
            new PlacementOption(false, [
                { letter: 'A', position: new Position(5, 7) },
                { letter: 'R', position: new Position(6, 7) },
            ]),
            new PlacementOption(false, [
                { letter: 'R', position: new Position(5, 7) },
                { letter: 'A', position: new Position(6, 7) },
            ]),
            new PlacementOption(false, [
                { letter: 'R', position: new Position(5, 7) },
                { letter: 'A', position: new Position(6, 7) },
                { letter: 'A', position: new Position(8, 7) },
            ]),
            new PlacementOption(false, [
                { letter: 'A', position: new Position(5, 6) },
                { letter: 'R', position: new Position(6, 6) },
            ]),
            new PlacementOption(false, [
                { letter: 'A', position: new Position(4, 7) },
                { letter: 'R', position: new Position(5, 7) },
                { letter: 'A', position: new Position(6, 7) },
            ]),
        ];
        const result = vP['getPlayablePositions'](availableLetters);
        expect(result).to.deep.equal(expectedReturn);
    });

    it('should choose a word on 1st turn', () => {
        const result = vP.chooseWords([...'ABCDLO']);
        expect(result).to.not.equal(undefined);
        for (const placement of result) {
            expect(placement[0].newLetters[0].position.row).to.equal(7);
            expect(placement[0].newLetters[0].position.col).to.equal(7);
        }
    });

    it('should choose a word connected to words on board', () => {
        game.board.place([
            { letter: 'a', position: new Position(7, 6) },
            { letter: 's', position: new Position(7, 7) },
        ]);
        const rack = [...'ABCDLO'];
        const result = vP.chooseWords(rack);

        expect(result).to.not.equal(undefined);
        const possibleLetters = rack.concat([...'as']);
        for (const placement of result) {
            expect(placement[0].newLetters.every((l) => possibleLetters.includes(l.letter))).to.equal(true);
        }
    });
});
