import { PlacementOption } from '@app/classes/placement-option';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { GameTile } from './game-tile';
import * as Multipliers from './multipliers';
import { Position, WordGetter } from './word-getter';

const CONTACT_CHAR = '#';
const BOARD_LENGTH = 15;
const HALF_LENGTH = 7;
const WORD_LENGTH_BONUS = 7;
const BONUS_POINTS = 50;
const BOARD_PLACEMENT_DELAY = 3000; // ms

export class Board {
    board: GameTile[][];
    wordGetter: WordGetter;

    constructor(private dictionnary: DictionnaryService) {
        this.board = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            this.board[i] = [];
            for (let j = 0; j < BOARD_LENGTH; j++) {
                this.board[i][j] = new GameTile(1);
            }
        }
        this.initList(Multipliers.MULT_WORDS_3, 1, 3);
        this.initList(Multipliers.MULT_WORDS_2, 1, 2);
        this.initList(Multipliers.MULT_LETTERS_3, 3);
        this.initList(Multipliers.MULT_LETTERS_2, 2);
        this.wordGetter = new WordGetter(this.board);
    }

    async placeWord(word: string, row: number, col: number, isHorizontal?: boolean): Promise<number> {
        isHorizontal ||= this.isInContact(row, col, false);
        const triedPlacement = new PlacementOption(row, col, isHorizontal, word);

        if (!this.isWordInBound(triedPlacement)) throw new Error('Placement invalide le mot ne rentre pas dans la grille');
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, BOARD_PLACEMENT_DELAY);
        });
        if (!this.firstWordValidation(triedPlacement)) throw new Error('Placement invalide pour le premier mot');
        const contacts = this.getContacts(triedPlacement);

        const words = this.wordGetter.getWords(triedPlacement, contacts);
        if (!words.every((wordOption) => this.dictionnary.isValidWord(wordOption.word)))
            throw new Error('Un des mots crees ne fait pas partie du dictionnaire');
        const score = this.getScore(words, true);
        return word.length === WORD_LENGTH_BONUS ? score + BONUS_POINTS : score;
    }

    getPlayablePositions(rackLength: number): PlacementOption[] {
        const arrayPos: PlacementOption[] = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            for (let j = 0; j < BOARD_LENGTH; j++) {
                if (!this.board[i][j].empty) continue;
                // pour chaque orientation
                for (const isHorizontal of [true, false]) {
                    const word = this.getPositionString(new PlacementOption(i, j, isHorizontal, ''), rackLength);
                    if ([...word].some((char) => char !== ' ')) arrayPos.push(new PlacementOption(i, j, isHorizontal, word));
                }
            }
        }
        return arrayPos;
    }

    private getScore(words: PlacementOption[], placeWord: boolean): number {
        let score = 0;
        words.forEach((word) => {
            let wordScore = 0;
            let wordMultiplier = 1;

            for (let offset = 0; offset < word.word.length; offset++) {
                const pos = WordGetter.wordWithOffset(word, offset);
                const tile = this.board[pos.row][pos.col];

                if (tile.empty) tile.setLetter(word.word.charAt(offset));
                wordScore += tile.getPoints();
                wordMultiplier *= tile.wordMultiplier;
            }
            score += wordScore * wordMultiplier;
        });
        this.changeNewlyPlaced(words[0], placeWord);
        return score;
    }

    private changeNewlyPlaced(attemptedWord: PlacementOption, placeWord: boolean) {
        let offset = 0;
        while (offset < attemptedWord.word.length) {
            const pos = WordGetter.wordWithOffset(attemptedWord, offset);
            const tile = this.board[pos.row][pos.col];

            if (!placeWord && tile.newlyPlaced) {
                tile.deleteLetter();
            } else {
                tile.newlyPlaced = false;
            }
            offset++;
        }
    }

    private getContacts(placement: PlacementOption): number[][] {
        if (this.board[HALF_LENGTH][HALF_LENGTH].empty) return [];
        const contacts = [];
        let collisions = 0;

        let pos = this.findStart(placement);
        placement = new PlacementOption(pos.row, pos.col, placement.isHorizontal, placement.word);

        for (let offset = 0; this.containsLetter(pos.row, pos.col) || offset <= placement.word.length + collisions; offset++) {
            pos = WordGetter.wordWithOffset(placement, offset);

            if (!this.board[pos.row][pos.col].empty) collisions++;
            else if (offset < placement.word.length + collisions && this.isInContact(pos.row, pos.col, placement.isHorizontal)) contacts.push([pos.row, pos.col, offset - collisions]);
        }
        if (collisions === 0 && contacts.length === 0) throw new Error('Placement invalide aucun point de contact');
        return contacts;
    }

    private firstWordValidation(placement: PlacementOption): boolean {
        if (!this.board[HALF_LENGTH][HALF_LENGTH].empty) return true;
        const length = placement.word.length - 1;
        if (placement.isHorizontal && placement.row === HALF_LENGTH && placement.col <= HALF_LENGTH && placement.col + length >= HALF_LENGTH)
            return true;
        return !placement.isHorizontal && placement.col === HALF_LENGTH && placement.row <= HALF_LENGTH && placement.row + length >= HALF_LENGTH;
    }

    private isWordInBound(placement: PlacementOption): boolean {
        let collisions = 0;
        if (placement.row < 0 || placement.col < 0) return false;
        for (let offset = 0; offset < placement.word.length + collisions; offset++) {
            const pos = WordGetter.wordWithOffset(placement, offset);

            if (pos.row >= BOARD_LENGTH || pos.col >= BOARD_LENGTH) return false;
            if (this.containsLetter(pos.row, pos.col)) collisions++;
        }
        return true;
    }

    private getPositionString(placement: PlacementOption, rackLength: number): string {
        let position = '';
        let collisions = 0;
        if (placement.isHorizontal) while (this.containsLetter(placement.row, placement.col - 1)) placement.col--;
        else while (this.containsLetter(placement.row - 1, placement.col)) placement.row--;

        for (let offset = 0; ; offset++) {
            const pos = WordGetter.wordWithOffset(placement, offset);
            if (pos.row >= BOARD_LENGTH || pos.col >= BOARD_LENGTH) break;
            if (offset - collisions >= rackLength && !this.containsLetter(pos.row, pos.col)) break;

            if (this.containsLetter(pos.row, pos.col)) {
                position += this.board[pos.row][pos.col].getChar();
                collisions++;
            } else if (this.isInContact(pos.row, pos.col, placement.isHorizontal)) {
                position += CONTACT_CHAR;
            } else {
                position += ' ';
            }
        }
        return position;
    }

    private findStart(placement: PlacementOption): Position {
        let row = placement.row;
        let col = placement.col;
        if (placement.isHorizontal) while (col > 0 && !this.board[row][col - 1].empty) col--;
        else while (row > 0 && !this.board[row - 1][col].empty) row--;
        return { row, col };
    }

    private containsLetter(row: number, col: number) {
        const inBound = row >= 0 && row < BOARD_LENGTH && col >= 0 && col < BOARD_LENGTH;
        return inBound && !this.board[row][col].empty;
    }

    private isInContact(row: number, col: number, isWordHorizontal: boolean): boolean {
        return isWordHorizontal
            ? (row - 1 >= 0 && !this.board[row - 1][col].empty) || (row + 1 < BOARD_LENGTH && !this.board[row + 1][col].empty)
            : (col - 1 >= 0 && !this.board[row][col - 1].empty) || (col + 1 < BOARD_LENGTH && !this.board[row][col + 1].empty);
    }

    private initList(array: number[][], multLetter: number, multWord?: number) {
        for (const position of array) {
            this.board[position[0]][position[1]] = new GameTile(multLetter, multWord);
        }
    }
}
