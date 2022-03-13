import { Letter } from '@app/letter';
import { Board } from './board';
import { Game } from './game';

const AI_ID = 1;
const BOARD_LENGTH = 15;

export class JoueurVirtuel {
    board: Board;
    myRack: Letter[];

    constructor(readonly isDebutant: boolean, game: Game) {
        this.board = game.board;
        this.myRack = game.reserve.letterRacks[AI_ID];
    }

    playTurn() {
        const random = Math.floor(Math.random() * 10);
        if (this.isDebutant && random === 0) {
            // skipTurn
        } else if (this.isDebutant && random === 1) {
            // echangerLettres
        } else {
            // play word
        }
        return;
    }

    getPlayablePositions() {
        const positions = this.board.getPlayablePositions(this.myRack.length);
        const arrayPos: any[][] = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            for (let j = 0; j < BOARD_LENGTH; j++) {
                let valid = false;
                for (const char of positions[i][j][0]) {
                    if (char !== ' ') valid = true;
                }
                if (valid) arrayPos.push([i, j, true, positions[i][j][0]]);

                valid = false;
                for (const char of positions[i][j][1]) {
                    if (char !== ' ') valid = true;
                }
                if (valid) arrayPos.push([i, j, false, positions[i][j][1]]);
            }
        }
        const result = this.validateCrosswords(arrayPos);
        console.log(result);
        console.log(this.rackToString());
    }

    private validateCrosswords(array: any[][]): any[][] {
        let validWords: any[][] = [];
        let starRemains = false;
        for (const option of array) {
            let letterCount = 0;
            let oneStar = false;
            const triedWord: string = option[3];
            let availableLetters = this.rackToString();
            for (const letter of triedWord) {
                if (letter.toUpperCase() === letter) {
                    for (const rackLetter of availableLetters) {
                        if (rackLetter === letter) availableLetters = availableLetters.replace(rackLetter, '');
                    }
                }
                if (letter === '*') {
                    if (oneStar) starRemains = true;
                    const replacementOptions = this.starReplacement(option, letterCount, availableLetters, triedWord);
                    validWords = validWords.concat(replacementOptions);
                    if (replacementOptions.length === 0 && !oneStar) validWords.push([option[0], option[1], option[2], option[3].slice(0, letterCount)]);
                    oneStar = true;
                }
                letterCount++;
            }
            if (!oneStar) validWords.push(option);
        }
        return starRemains ? this.validateCrosswords(validWords) : validWords;
    }

    starReplacement(option: any[], letterCount: number, availableLetters: string, triedWord: string) {
        let validWords: any[][] = [];
        const row = option[2] ? option[0] : option[0] + letterCount;
        const col = option[2] ? option[1] + letterCount : option[1];
        const crossWord = this.board.wordGetter.getStringPositionVirtualPlayer(row, col, !option[2]);
        //par prog dynamique se rappeler des permutations possibles
        for (const rackLetter of availableLetters) {
            const attemptedCrossword = crossWord.replace('*', rackLetter.toLowerCase());
            if (this.board.dictionnary.isValidWord(attemptedCrossword)) {
                validWords.push([option[0], option[1], option[2], triedWord.replace('*', rackLetter)]);
            }
        }
        return validWords;
    }

    rackToString(): string {
        let string = '';
        for (const letter of this.myRack) {
            string += letter.name;
        }
        return string;
    }
}
