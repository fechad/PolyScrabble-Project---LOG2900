import { DictionnaryService } from '@app/services/dictionnary.service';
import { Game } from './game';
import { JoueurVirtuel } from './joueur-virtuel';
import { Parameters } from './parameters';

describe('Joueur virtuel', () => {
    let dictionnary: DictionnaryService;
    let jv: JoueurVirtuel;
    let game: Game;

    before(async () => {
        dictionnary = new DictionnaryService();
        await dictionnary.init();
    });

    beforeEach(() => {
        const players = [
            { name: 'Bob', id: '0', connected: true },
            { name: 'joueur-virtuel', id: 'JV', connected: true },
        ];
        const parameters = new Parameters();
        game = new Game(0, players, parameters, dictionnary);
        jv = new JoueurVirtuel(true, game);
    });

    it('should get playables position', () => {
        jv.board.board[7][6].setLetter('a');
        jv.board.board[7][7].setLetter('s');
        jv.getPlayablePositions();
    });
});
