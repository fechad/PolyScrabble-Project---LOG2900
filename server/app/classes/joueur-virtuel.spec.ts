import { DictionnaryService } from '@app/services/dictionnary.service';
import { Game } from './game';
import { JoueurVirtuel } from './joueur-virtuel';
import { Parameters } from './parameters';
import { Player, Room } from './room';

describe('Joueur virtuel', () => {
    let players: Player[];
    let parameters: Parameters;
    let dictionnary: DictionnaryService;
    let jv: JoueurVirtuel;
    let game: Game;

    before(async () => {
        dictionnary = new DictionnaryService();
        await dictionnary.init();
    });

    beforeEach(() => {
        players = [
            { name: 'Bob', id: '0', connected: true, virtual: false },
            { name: 'JoueurVirtuel', id: 'VP', connected: true, virtual: false },
        ];
        parameters = new Parameters();
        const room = new Room(0, players[0].id, players[0].name, parameters);
        room.addPlayer(players[1].id, players[1].name, false);
        game = new Game(room, dictionnary);
        jv = new JoueurVirtuel(true, game);
    });

    it('should get playables position', () => {
        jv.board.board[7][6].setLetter('a');
        jv.board.board[7][7].setLetter('s');
        jv.getPlayablePositions();
    });
});
