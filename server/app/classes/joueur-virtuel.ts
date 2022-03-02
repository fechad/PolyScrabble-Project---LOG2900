import { Board } from './board';
import { Game } from './game';

const BOARD_LENGTH = 15;

export class JoueurVirtuel {
    board: Board;

    constructor(readonly isDebutant: boolean, game: Game) {
        this.board = game.board;
    }

    playTurn() {
        return;
    }

    getPlayablePositions() {
        const positionsH = this.board.getPlayablePositions(7);
        const arrayPos: any[][] = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            for (let j = 0; j < BOARD_LENGTH; j++) {
                let valid = false;
                for (const char of positionsH[i][j][0]) {
                    if (char !== ' ') valid = true;
                }
                if (valid) arrayPos.push([i, j, true, positionsH[i][j][0]]);

                valid = false;
                for (const char of positionsH[i][j][1]) {
                    if (char !== ' ') valid = true;
                }
                if (valid) arrayPos.push([i, j, false, positionsH[i][j][1]]);
            }
        }
        console.log(arrayPos);
    }
}
