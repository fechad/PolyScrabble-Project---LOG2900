import { Board } from './board';
import { Game } from './game';

const BOARD_LENGTH = 15;

export class JoueurVirtuel {
    board: Board;

    constructor(readonly isDebutant: boolean, private game: Game) {
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
        this.validateCrosswords(arrayPos);
        // console.log(arrayPos);
    }

    private validateCrosswords(array: any[][]): any[][] {
        // let validWords: any[][] = [];
        const rack = this.game.reserve.letterRacks[1];

        for (const option of array) {
            let letterCount = 0;
            // let replacements: string[] = [];
            for (let letter of option[3]) {
                if (letter === '*') {
                    const row = option[2] ? option[0] : option[0] + letterCount;
                    const col = option[2] ? option[1] + letterCount : option[1];
                    const crossWord = this.board.wordGetter.getStringPositionVirtualPlayer(row, col, !option[2]);
                    console.log(row, !option[2], col, crossWord);
                    for (const rackLetter of rack) {
                        const attemptedWord = crossWord.replace('*', rackLetter.name.toLowerCase());
                        if (this.game.dictionnaryService.isValidWord(attemptedWord)) {
                            console.log(true, attemptedWord);
                        }
                    }
                }
                letterCount++;
            }
        }
        return [[0]];
    }
}
