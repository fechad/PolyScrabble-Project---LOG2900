import { Letter } from '@app/letter';
import { Board } from './board';
import { Game } from './game';

const AI_ID = 1;
const THRESHOLD = 0.5;

export class VirtualPlayer {
    board: Board;
    myRack: Letter[];
    constructor(readonly isBeginner: boolean, private game: Game) {
        this.board = game.board;
        this.myRack = game.reserve.letterRacks[AI_ID];
    }

    playTurn() {
        const random = Math.floor(Math.random() * 10);
        if (this.isBeginner && random === 0) {
            this.game.skipTurn(AI_ID.toString()); // to test
        } else if (this.isBeginner && random === 1) {
            let list = '';
            this.myRack.map((letter) => {
                if (Math.random() >= THRESHOLD) {
                    list += letter.name.toLowerCase();
                }
            });
            this.game.changeLetters(list, AI_ID.toString());
        } else {
            this.game.message({ emitter: AI_ID.toString(), text: 'I want to place some letters' });
        }
    }
}
