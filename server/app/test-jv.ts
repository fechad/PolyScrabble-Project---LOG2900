// WARNING : Make sure to always import 'reflect-metadata' and 'module-alias/register' first
import 'module-alias/register';
import 'reflect-metadata';
import { Game } from './classes/game';
import { Difficulty, GameType, Parameters } from './classes/parameters';
import { Position } from './classes/position';
import { Room } from './classes/room';
import { VirtualPlayer } from './classes/virtual-player';
import { AI_ID } from './constants';
import { DictionnaryService } from './services/dictionnary.service';

(async () => {
    const dictionnaryService = new DictionnaryService();
    await dictionnaryService.init();
    const params = new Parameters();
    params.gameType = GameType.Solo;
    const room = new Room(0, 'BOB', 'BOBBY', params);
    room.addPlayer(AI_ID, 'Étienne', true);
    const game = new Game(room, dictionnaryService);
    const vP = new VirtualPlayer(Difficulty.Expert, game, dictionnaryService.dictionnaries[0].trie);
    game.board.place([
        { letter: 'a', position: new Position(7, 6) },
        { letter: 's', position: new Position(7, 7) },
    ]);
    const rack = [...'ABCDLO'];
    vP.chooseWords(rack);
    process.exit(0);
})();
