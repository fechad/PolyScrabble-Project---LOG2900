// WARNING : Make sure to always import 'reflect-metadata' and 'module-alias/register' first
import * as fs from 'fs';
import 'module-alias/register';
import 'reflect-metadata';
import { isDeepStrictEqual } from 'util';
import { Game } from './classes/game';
import { Difficulty, Parameters } from './classes/parameters';
import { PlacementOption } from './classes/placement-option';
import { Position } from './classes/position';
import { Room, State } from './classes/room';
import { PlacementScore, VirtualPlayer } from './classes/virtual-player';
import * as cst from './constants';
import { DataBaseController } from './controllers/db.controller';
import { DictionnaryService } from './services/dictionnary.service';
import { GameHistoryService } from './services/game-history-service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import seedrandom = require('seedrandom');

/* eslint-disable dot-notation */

const createTestCase = (idx: number, game: Game): string => {
    const rack = game.reserve.letterRacks[game['isPlayer0Turn'] ? cst.MAIN_PLAYER : cst.OTHER_PLAYER].join('');
    return `
    it('test case ${idx}', () => {
        game.board.place([
            ${game.board['board']
                .map((row, i) =>
                    row
                        .filter((tile) => tile.letter)
                        .map((tile, j) => {
                            return `{ letter: '${tile.letter}', position: new Position(${i}, ${j}) },\n`;
                        })
                        .join(''),
                )
                .join('')}
        ]);
        const rack = [...'${rack}'];
        const options = vP.chooseWords(rack);
        const wordGetter = game['wordGetter'];
        for (const option of options) {
            const words = wordGetter.getWords(option.placement);
            for (const word of words) {
                expect(dictionnaryService.isValidWord(word.word)).to.equal(true, \`\${word} is not a valid word\`);
            }
        }
    });
    `;
};

const playGame = async (dictionnaryService: DictionnaryService, gameHistoryService: GameHistoryService, fullTest: boolean) => {
    const params = new Parameters();
    params.difficulty = Difficulty.Expert;

    const ID_AI_2 = 'BOB';
    const room = new Room(0, ID_AI_2, 'BOBBY', params);
    room.addPlayer(cst.AI_ID, 'Étienne', true, 'a');
    room.start();
    const game = new Game(room, dictionnaryService, gameHistoryService);
    game['timeoutHandler'] = () => {
        /* Handle turns manually */
    };
    const prevSetTimeout = global.setTimeout;
    global.setTimeout = ((fct: () => void) => fct()) as unknown as typeof global.setTimeout;
    const vP = new VirtualPlayer(Difficulty.Expert, game, dictionnaryService.dictionnaries[0].trie);
    const vP2 = new VirtualPlayer(Difficulty.Expert, game, dictionnaryService.dictionnaries[0].trie);
    vP.id = ID_AI_2;
    game['isPlayer0Turn'] = true;
    // game.eventEmitter.addListener('message', (message) => console.log(message));
    game.eventEmitter.addListener('game-error', (_id, error) => {
        console.error('\x1B[31;1mERROR:\x1B[0m', error);
        console.log(game.reserve.letterRacks);
        console.log('=====================');
        console.log(' 0123456789ABCDEF');
        console.log(game.board['board'].map((row, i) => i + row.map((tile) => tile.letter || ' ').join('')).join('\n'));
        console.log(createTestCase(2, game));
        process.exit(1);
    });
    while (room.getState() !== State.Ended) {
        if (fullTest) {
            const found = vP.chooseWords(game.reserve.letterRacks[0]);
            const dummyFound = dummyFind(game, dictionnaryService, game.reserve.letterRacks[0]);
            if (!isDeepStrictEqual(found, dummyFound)) {
                console.log('Not equal to dummy version');
                await fs.promises.writeFile('found.json', JSON.stringify(found));
                await fs.promises.writeFile('dummy.json', JSON.stringify(dummyFound));
                process.exit(1);
            }
        }
        await vP.playTurn();
        await vP2.playTurn();
    }
    global.setTimeout = prevSetTimeout;
};

const genPermutations = (rack: string[], prefix: string[] = [], out: string[][] = []): string[][] => {
    if (rack.length === 0) {
        out.push(prefix);
        return out;
    }
    rack.forEach((letter, i) => {
        const newRack = rack.slice();
        newRack.splice(i, 1);
        genPermutations(newRack, [...prefix, letter], out);
    });
    return out;
};

const dummyFind = (game: Game, dictionnaryService: DictionnaryService, rack: string[]): PlacementScore[] => {
    const validPlacements: PlacementScore[] = [];
    console.time('HERE');
    const permutations = genPermutations(rack);
    console.timeEnd('HERE');
    for (let row = 0; row < cst.BOARD_LENGTH; row++) {
        for (let col = 0; col < cst.BOARD_LENGTH; col++) {
            const pos = new Position(row, col);
            for (const isHorizontal of [true, false]) {
                for (const permutation of permutations) {
                    console.time('THERE');
                    try {
                        const placement = PlacementOption.newPlacement(game.board, pos, isHorizontal, permutation);
                        const words = game['wordGetter'].getWords(placement);
                        if (!words.every((wordOption) => dictionnaryService.isValidWord(0, wordOption.word))) continue;
                        const score = words.reduce((total, word) => word.score + total, 0);
                        validPlacements.push({ score, placement });
                    } catch {
                        /* If fails, ignore */
                    }
                    console.timeEnd('THERE');
                }
            }
        }
    }
    return validPlacements;
};

(async () => {
    const seed = 'hello';
    seedrandom(seed, { global: true });
    console.log('\x1B[32mSeed:', seed, '\x1B[0m');

    const dictionnaryService = new DictionnaryService();
    await dictionnaryService.init();
    const gameHistoryService = new GameHistoryService(new DataBaseController());

    for (let i = 0; ; i++) {
        console.log('Iteration ' + (i + 1));
        await playGame(dictionnaryService, gameHistoryService, true);
    }
})();
