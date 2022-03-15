import { DictionnaryService } from '@app/services/dictionnary.service';
import { Board } from './board';
import { Game } from './game';

const AI_ID = 'VP';
const AI_GAME_INDEX = 1;
const PROBABILITY = 10;
const BOARD_LENGTH = 15;
const CONTACT_CHAR = '*';
// const THRESHOLD = 0.5;
const DELAY_CHECK_TURN = 1000; // ms

export type PlacementOption = { row: number; col: number; isHorizontal: boolean; word: string };

/* eslint-disable @typescript-eslint/no-explicit-any */

export class VirtualPlayer {
    board: Board;

    constructor(readonly isBeginner: boolean, private game: Game, private dictionnaryService: DictionnaryService) {
        this.board = game.board;
        console.log(`Virtual player created of difficulty ${isBeginner ? 'beginner' : 'expert'} for game ${game.id}`);
    }
    
    waitForTurn() {
        setInterval(() => {
            if (this.game.getCurrentPlayer().id === AI_ID) {
                this.playTurn();
            }
        }, DELAY_CHECK_TURN);
    }

    private playTurn() {
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

    //a mettre private quand connected
    getPlayablePositions(): PlacementOption[] {
        const positions = this.board.getPlayablePositions(this.game.reserve.letterRacks[AI_GAME_INDEX].length);
        const arrayPos: PlacementOption[] = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            for (let j = 0; j < BOARD_LENGTH; j++) {
                // pour chaque orientation
                for (let k = 0; k < 2; k++) {
                    let valid = false;
                    for (const char of positions[i][j][k]) {
                        if (char !== ' ') valid = true;
                    }
                    if (valid) arrayPos.push({ row: i, col: j, isHorizontal: k === 0, word: positions[i][j][k] });
                }
            }
        }
        return this.validateCrosswords(arrayPos);
    }

    private validateCrosswords(array: PlacementOption[], exploredOptions: PlacementOption[] = []): PlacementOption[] {
        let validWords: PlacementOption[] = [];
        let starRemains = false;
        for (const option of array) {
            let letterCount = 0;
            let oneContact = false;
            let availableLetters = this.rackToString();
            for (const letter of option.word) {
                if (letter.toLowerCase() !== letter) {
                    availableLetters = availableLetters.replace(letter, '');
                }
                if (letter === CONTACT_CHAR) {
                    if (oneContact) {
                        starRemains = true;
                        break;
                    }
                    oneContact = true;
                    const replacementOptions = this.contactReplacement(exploredOptions, option, letterCount, availableLetters);
                    validWords = validWords.concat(replacementOptions);
                    if (replacementOptions.length === 0) validWords.push(this.deepCopyPlacementOption(option, option.word.slice(0, letterCount)));
                }
                letterCount++;
            }
            if (!oneContact) validWords.push(option);
        }
        return starRemains ? this.validateCrosswords(validWords, exploredOptions) : validWords;
    }

    private contactReplacement(
        exploredOptions: PlacementOption[],
        option: PlacementOption,
        letterCount: number,
        rackLetters: string,
    ): PlacementOption[] {
        const row = option.isHorizontal ? option.row : option.row + letterCount;
        const col = option.isHorizontal ? option.col + letterCount : option.col;
        let alreadyFound = false;
        const validWords: PlacementOption[] = [];
        for (const explored of exploredOptions) {
            if (explored.row === row && explored.col === col && explored.isHorizontal === option.isHorizontal) {
                for (const solution of explored.word) {
                    let letterAvailable = false;
                    for (const available of rackLetters) {
                        if (available === solution) letterAvailable = true;
                    }
                    if (letterAvailable) validWords.push(this.deepCopyPlacementOption(option, option.word.replace(CONTACT_CHAR, solution)));
                }
                alreadyFound = true;
                break;
            }
        }
        if (!alreadyFound) {
            const crossword = this.board.wordGetter.getStringPositionVirtualPlayer(row, col, !option.isHorizontal);
            const possibleLetters = this.findNewOptions(validWords, option, rackLetters, crossword);
            exploredOptions.push(this.deepCopyPlacementOption(option, possibleLetters));
        }
        return validWords;
    }

    private findNewOptions(validWords: PlacementOption[], option: PlacementOption, rackLetters: string, crossword: string) {
        let possibleLetters = '';
        let alreadyIn = false;
        for (const rackLetter of rackLetters) {
            for (const letter of possibleLetters) if (letter === rackLetter) alreadyIn = true;
            if (alreadyIn) break;
            const attemptedCrossword = crossword.replace('*', rackLetter.toLowerCase());
            if (this.dictionnaryService.isValidWord(attemptedCrossword)) {
                validWords.push(this.deepCopyPlacementOption(option, option.word.replace(CONTACT_CHAR, rackLetter)));
                possibleLetters += rackLetter;
            }
        }
        return possibleLetters;
    }

    private deepCopyPlacementOption(placement: PlacementOption, newWord?: string): PlacementOption {
        return { row: placement.row, col: placement.col, isHorizontal: placement.isHorizontal, word: newWord ? newWord : placement.word };
    }

    private rackToString(): string {
        let string = '';
        for (const letter of this.game.reserve.letterRacks[AI_GAME_INDEX]) {
            string += letter.name;
        }
        return string;
    }
}
