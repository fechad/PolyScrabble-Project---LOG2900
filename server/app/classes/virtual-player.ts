import { LetterPlacement, PlacementOption } from '@app/classes/placement-option';
import * as cst from '@app/constants';
import { Board } from './board';
import { Game } from './game';
import { LetterNode } from './letter-node';
import { Difficulty } from './parameters';
import { Position } from './position';
import { State } from './room';
import { WordGetter } from './word-getter';

type SearchHead = {
    position: Position;
    isHorizontal: boolean;
    letters: LetterPlacement[];
    contact: boolean;
    node: LetterNode;
    rack: string[];
};

export class VirtualPlayer {
    private board: Board;
    private wordGetter: WordGetter;

    constructor(readonly difficulty: Difficulty, private game: Game, private trie: LetterNode) {
        this.board = game.board;
        this.wordGetter = new WordGetter(this.board);
        console.log(`Virtual player created of difficulty ${difficulty === Difficulty.Beginner ? 'beginner' : 'expert'} for game ${game.id}`);
    }

    waitForTurn() {
        let alreadyPlaying = false;
        const waitTurnInterval = setInterval(async () => {
            if (this.game.room.getState() !== State.Started) clearInterval(waitTurnInterval);
            if (this.game.getCurrentPlayer().id !== cst.AI_ID || alreadyPlaying) return;
            alreadyPlaying = true;
            await this.playTurn();
            alreadyPlaying = false;
        }, cst.DELAY_CHECK_TURN);
    }

    async playTurn() {
        const randomOutOfTen = Math.floor(Math.random() * cst.PROBABILITY);
        if (this.difficulty === Difficulty.Beginner && randomOutOfTen === 0) {
            // 10 % chance
            this.game.skipTurn(cst.AI_ID);
        } else if (this.difficulty === Difficulty.Beginner && randomOutOfTen === 1) {
            // 10 % chance
            if (this.game.reserve.getCount() > cst.MINIMUM_EXCHANGE_RESERVE_COUNT) {
                const sliceIndex = Math.floor(Math.random() * this.rack().length);
                this.game.changeLetters(this.rack().slice(sliceIndex), cst.AI_ID);
            } else this.game.skipTurn(cst.AI_ID);
        } else {
            // 80 % chance
            const sortedWordOptions = this.chooseWords(this.rack());
            const randomIndex = Math.floor(Math.random() * sortedWordOptions.length);
            const chosenWord = sortedWordOptions[randomIndex];
            if (chosenWord === undefined) {
                setTimeout(() => {
                    this.game.skipTurn(cst.AI_ID);
                }, cst.DELAY_NO_PLACEMENT);
            } else {
                const letters = chosenWord[0].newLetters.map((l) => l.letter);
                await this.game.placeLetters(cst.AI_ID, letters, chosenWord[0].newLetters[0].position, chosenWord[0].isHorizontal);
            }
        }
    }

    chooseWords(freeLetters: string[]): [PlacementOption, number][] {
        const MIDDLE = new Position(cst.MIDDLE_INDEX, cst.MIDDLE_INDEX);
        const bracket = this.getRandomPointBracket();
        const isStart = !this.board.get(MIDDLE).letter;
        return this.getPlayablePositions(freeLetters, isStart)
            .map((placement) => {
                const score = this.wordGetter
                    .getWords(placement)
                    .map((p) => p.score)
                    .reduce((acc, x) => acc + x, 0);
                const out: [PlacementOption, number] = [placement, score];
                return out;
            })
            .filter(([_placement, score]) => score >= bracket[cst.LOWER_BOUND_INDEX] && score <= bracket[cst.HIGHER_BOUND_INDEX])
            .sort((a, b) => a[1] - b[1]);
    }

    private getPlayablePositions(rack: string[], start: boolean): PlacementOption[] {
        const searchStack: SearchHead[] = [];
        if (start) {
            const isHorizontal = Math.random() > cst.HALF_PROBABILITY;
            searchStack.push({
                position: new Position(cst.HALF_LENGTH, cst.HALF_LENGTH),
                isHorizontal,
                letters: [],
                node: this.trie,
                contact: true,
                rack,
            });
        } else {
            for (let i = 0; i < cst.BOARD_LENGTH; i++) {
                for (let j = 0; j < cst.BOARD_LENGTH; j++) {
                    // for each direction
                    for (const isHorizontal of [true, false]) {
                        searchStack.push({ position: new Position(i, j), isHorizontal, letters: [], node: this.trie, contact: false, rack });
                    }
                }
            }
        }
        const validPositions: PlacementOption[] = [];
        for (;;) {
            const head = searchStack.pop();
            if (!head) break;
            const nextPos = head.position.withOffset(head.isHorizontal, 1);
            const nextLetter = this.board.get(nextPos).letter;
            if (!nextLetter && head.contact && head.node.terminal) validPositions.push(new PlacementOption(head.isHorizontal, head.letters));
            if (nextLetter) {
                const nextNode = head.node.getNext(nextLetter);
                if (!nextNode) continue;
                searchStack.push({ ...head, position: nextPos, node: nextNode, contact: true });
            } else {
                head.rack.forEach((letter, i) => {
                    const nextNode = head.node.getNext(letter);
                    if (!nextNode) return;
                    const newRack = head.rack.slice();
                    newRack.splice(i, 1);
                    const newLetters: LetterPlacement[] = [...head.letters, { letter, position: head.position }];
                    searchStack.push({ ...head, position: nextPos, node: nextNode, letters: newLetters, rack: newRack });
                });
            }
        }
        return validPositions;
    }

    private getRandomPointBracket() {
        const randomOutOfTen = Math.floor(Math.random() * cst.PROBABILITY);
        if (randomOutOfTen < cst.PROBABILITY_OF_40) {
            // 40 % chance
            return cst.LOWER_POINT_BRACKET;
        } else if (randomOutOfTen < cst.PROBABILITY_OF_30) {
            // 30 % chance
            return cst.MIDDLE_POINT_BRACKET;
        } else {
            // 30 % chance
            return cst.HIGHER_POINT_BRACKET;
        }
    }

    private rack(): string[] {
        return this.game.reserve.letterRacks[cst.AI_GAME_INDEX];
    }
}
