// WARNING : Make sure to always import 'reflect-metadata' and 'module-alias/register' first
import 'module-alias/register';
import 'reflect-metadata';
import { Game } from './classes/game';
import { Difficulty, Parameters } from './classes/parameters';
import { Room, State } from './classes/room';
import { VirtualPlayer } from './classes/virtual-player';
import * as cst from './constants';
import { DictionnaryService } from './services/dictionnary.service';
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

const playGame = async (dictionnaryService: DictionnaryService) => {
    const params = new Parameters();
    params.difficulty = Difficulty.Expert;

    const ID_AI_2 = 'BOB';
    const room = new Room(0, ID_AI_2, 'BOBBY', params);
    room.addPlayer(cst.AI_ID, 'Étienne', true, 'a');
    room.start();
    const game = new Game(room, dictionnaryService);
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
        await vP.playTurn();
        await vP2.playTurn();
    }
    global.setTimeout = prevSetTimeout;
};

(async () => {
    const seed = 'hello';
    seedrandom(seed, { global: true });
    console.log('\x1B[32mSeed:', seed, '\x1B[0m');

    const dictionnaryService = new DictionnaryService();
    await dictionnaryService.init();

    for (let i = 0; ; i++) {
        console.log('Iteration ' + (i + 1));
        await playGame(dictionnaryService);
    }
})();
