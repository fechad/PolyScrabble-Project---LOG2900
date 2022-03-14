import { Letter } from '@app/letter';
import { Board } from './board';
import { Game } from './game';

const AI_ID = 1;
const BOARD_LENGTH = 15;
const PROBABILITY = 10;
const CONTACT_CHAR = '*';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class JoueurVirtuel {
    board: Board;
    myRack: Letter[];

    constructor(readonly isDebutant: boolean, game: Game) {
        this.board = game.board;
        this.myRack = game.reserve.letterRacks[AI_ID];
    }

    playTurn() {
        const random = Math.floor(Math.random() * PROBABILITY);
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
        const arrayPos: unknown[][] = [];
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
        const exploredOptions: any[][] = [];
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
                if (letter === CONTACT_CHAR) {
                    if (oneStar) starRemains = true;
                    const replacementOptions = this.contactReplacement(exploredOptions, option, letterCount, availableLetters, triedWord);
                    validWords = validWords.concat(replacementOptions);
                    if (replacementOptions.length === 0 && !oneStar)
                        validWords.push([option[0], option[1], option[2], option[3].slice(0, letterCount)]);
                    oneStar = true;
                }
                letterCount++;
            }
            if (!oneStar) validWords.push(option);
        }
        return starRemains ? this.validateCrosswords(validWords) : validWords;
    }

    private contactReplacement(exploredOptions: any[][], option: any[], letterCount: number, availableLetters: string, triedWord: string) {
        let alreadyFound = false;
        const validWords: any[][] = [];
        const row = option[2] ? option[0] : option[0] + letterCount;
        const col = option[2] ? option[1] + letterCount : option[1];
        for (const explored of exploredOptions) {
            if (explored[0] === row && explored[1] === col && explored[2] === option[2]) {
                for (const solution of explored[3]) {
                    validWords.push([option[0], option[1], option[2], triedWord.replace(CONTACT_CHAR, solution)]);
                }
                alreadyFound = true;
                break;
            }
        }
        if (!alreadyFound) {
            const crossWord = this.board.wordGetter.getStringPositionVirtualPlayer(row, col, !option[2]);
            let possibleLetters = '';
            for (const rackLetter of availableLetters) {
                const attemptedCrossword = crossWord.replace('*', rackLetter.toLowerCase());
                if (this.board.dictionnary.isValidWord(attemptedCrossword)) {
                    validWords.push([option[0], option[1], option[2], triedWord.replace(CONTACT_CHAR, rackLetter)]);
                    possibleLetters += rackLetter;
                }
            }
            exploredOptions.push([row, col, option[2], possibleLetters]);
        }
        return validWords;
    }

    private rackToString(): string {
        let string = '';
        for (const letter of this.myRack) {
            string += letter.name;
        }
        return string;
    }
}
