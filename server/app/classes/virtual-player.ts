import { PlacementOption } from '@app/classes/placement-option';
import { DictionnaryTrieService, WordConnection } from '@app/services/dictionnary-trie.service';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { Board } from './board';
import { Game } from './game';

const AI_ID = 'VP';
const AI_GAME_INDEX = 1;
const PROBABILITY = 10;
const BOARD_LENGTH = 15;
const CONTACT_CHAR = '#';
// const THRESHOLD = 0.5;
const DELAY_CHECK_TURN = 1000; // ms

// export type PlacementOption = { row: number; col: number; isHorizontal: boolean; word: string };

export class VirtualPlayer {
    board: Board;

    constructor(
        readonly isBeginner: boolean,
        private game: Game,
        private dictionnaryService: DictionnaryService,
        private trie: DictionnaryTrieService,
    ) {
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

    // a mettre private quand connected
    getPlayablePositions(): PlacementOption[] {
        const positions = this.board.getPlayablePositions(this.game.reserve.letterRacks[AI_GAME_INDEX].length);
        const arrayPos: PlacementOption[] = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            for (let j = 0; j < BOARD_LENGTH; j++) {
                // pour chaque orientation
                for (const k of [0, 1]) {
                    const valid = [...positions[i][j][k]].some((char) => char !== ' ');
                    if (valid) arrayPos.push(new PlacementOption(i, j, k === 0, positions[i][j][k]));
                }
            }
        }
        return this.validateCrosswords(arrayPos);
    }

    private playTurn() {
        const random = Math.floor(Math.random() * PROBABILITY);
        if (this.isBeginner && random === 0) {
            // this.game.skipTurn(AI_ID); // to test
            this.game.message({ emitter: AI_ID, text: 'I want to skip my turn' });
            this.game.skipTurn(AI_ID);
        } else if (this.isBeginner && random === 1) {
            /* let list = '';
            this.myRack.map((letter) => {
                if (Math.random() >= THRESHOLD) {
                    list += letter.name.toLowerCase();
                }
            });
            this.game.changeLetters(list, AI_ID);*/
            this.game.message({ emitter: AI_ID, text: 'I want to exchange letters' });
            this.game.skipTurn(AI_ID);
        } else {
            this.game.message({ emitter: AI_ID, text: 'I want to place some letters' });
            this.chooseword();
        }
        // temporaire en attendant implementation placer lettre AI
        this.waitForTurn();
    }

    private chooseword() {
        const concretePositions: PlacementOption[] = [];
        for (const position of this.getPlayablePositions()) {
            const connectedLetters = this.getWordConnections(position);
            let freeLetters = this.rackToString();
            [...position.word].forEach((letter) => {
                if (letter.toUpperCase() === letter) freeLetters = freeLetters.replace(letter.toLowerCase(), '');
            });
            this.trie.generatePossibleWords([...freeLetters], connectedLetters).forEach((word) => {
                const newPosition = position.deepCopy(word);
                newPosition.score = 5;
                newPosition.buildCommand(connectedLetters);
                concretePositions.push(newPosition);
            });
        }
        const chosen = concretePositions.reduce((acc, position) => {
            if (position.score < acc.score) return position;
            else return acc;
        });
        this.game.placeLetters(AI_ID, chosen.command, chosen.row, chosen.col, chosen.isHorizontal);
    }

    private getWordConnections(position: PlacementOption) {
        const connections: WordConnection[] = [];
        [...position.word].forEach((letter, index) => {
            if (letter !== ' ') connections.push({ connectedLetter: letter.toLowerCase(), index, isOnBoard: letter.toLowerCase() === letter });
        });
        connections.push({ connectedLetter: undefined, index: position.word.length - 1, isOnBoard: false });
        return connections;
    }

    private validateCrosswords(placementOptions: PlacementOption[], exploredOptions: PlacementOption[] = []): PlacementOption[] {
        let validWords: PlacementOption[] = [];
        let replacementOptions: PlacementOption[] = [];
        let starRemains = false;
        for (const option of placementOptions) {
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
                    replacementOptions = this.contactReplacement(exploredOptions, option, letterCount, availableLetters);
                    validWords = validWords.concat(replacementOptions);
                    if (replacementOptions.length === 0 && letterCount !== 0) validWords.push(option.deepCopy(option.word.slice(0, letterCount)));
                }
                letterCount++;
            }
            if (!oneContact) validWords.push(option);
        }
        if (starRemains) validWords = this.validateCrosswords(validWords, exploredOptions)
        return validWords;
    }

    private contactReplacement(
        exploredOptions: PlacementOption[],
        option: PlacementOption,
        letterCount: number,
        rackLetters: string,
    ): PlacementOption[] {
        const row = option.isHorizontal ? option.row : option.row + letterCount;
        const col = option.isHorizontal ? option.col + letterCount : option.col;
        const validWords: PlacementOption[] = [];
        const alreadyFound = exploredOptions.find(
            (explored) => explored.row === row && explored.col === col && explored.isHorizontal === option.isHorizontal,
        );
        if (alreadyFound) {
            for (const solution of alreadyFound.word) {
                const letterAvailable = [...rackLetters].some((letter) => letter === solution);
                if (letterAvailable) validWords.push(option.deepCopy(option.word.replace(CONTACT_CHAR, solution)));
            }
        } else {
            const crossword = this.board.wordGetter.getStringPositionVirtualPlayer(row, col, !option.isHorizontal);
            const possibleLetters = this.findNewOptions(validWords, option, rackLetters, crossword);
            exploredOptions.push(new PlacementOption(row, col, option.isHorizontal, possibleLetters));
        }
        return validWords;
    }

    private findNewOptions(validWords: PlacementOption[], option: PlacementOption, rackLetters: string, crossword: string) {
        let possibleLetters = '';
        for (const rackLetter of rackLetters) {
            if ([...possibleLetters].includes(rackLetter)) continue;
            const attemptedCrossword = crossword.replace(CONTACT_CHAR, rackLetter.toLowerCase());
            if (this.dictionnaryService.isValidWord(attemptedCrossword)) {
                validWords.push(option.deepCopy(option.word.replace(CONTACT_CHAR, rackLetter)));
                possibleLetters += rackLetter;
            }
        }
        return possibleLetters;
    }

    private rackToString(): string {
        return this.game.reserve.letterRacks[AI_GAME_INDEX].map((letter) => letter.name).join('');
    }
}
