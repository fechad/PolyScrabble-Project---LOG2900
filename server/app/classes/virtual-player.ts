import { Letter } from '@app/letter';
import { Board } from './board';
import { Game } from './game';

const AI_ID = 'VP';
const PROBABILITY = 10;
// const THRESHOLD = 0.5;
const DELAY_CHECK_TURN = 1000; // ms

export class VirtualPlayer {
    board: Board;
    myRack: Letter[];
    constructor(readonly isBeginner: boolean, private game: Game) {
        this.board = game.board;
        this.myRack = game.reserve.letterRacks[AI_ID];
    }

    playTurn() {
        const random = Math.floor(Math.random() * PROBABILITY);
        if (this.isBeginner && random === 0) {
            // this.game.skipTurn(AI_ID); // to test
            this.game.message({ emitter: AI_ID, text: 'I want to skip my turn' });
        } else if (this.isBeginner && random === 1) {
            /* let list = '';
            this.myRack.map((letter) => {
                if (Math.random() >= THRESHOLD) {
                    list += letter.name.toLowerCase();
                }
            });
            this.game.changeLetters(list, AI_ID);*/
            this.game.message({ emitter: AI_ID, text: 'I want to exchange letters' });
        } else {
            this.game.message({ emitter: AI_ID, text: 'I want to place some letters' });
        }
        // temporaire en attendant implementation placer lettre AI
        this.game.skipTurn(AI_ID);
        this.waitForTurn();
    }

    waitForTurn() {
        setInterval(() => {
            if (this.game.getCurrentPlayer().id === AI_ID) {
                this.playTurn();
            }
        }, DELAY_CHECK_TURN);
    }
}
