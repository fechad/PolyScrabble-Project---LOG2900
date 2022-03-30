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
    startingPosition: Position;
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
        const rack = this.game.reserve.letterRacks[cst.AI_GAME_INDEX];
        const randomOutOfTen = Math.floor(Math.random() * cst.PROBABILITY);
        if (this.difficulty === Difficulty.Beginner && randomOutOfTen === 0) {
            // 10 % chance
            this.game.skipTurn(cst.AI_ID);
        } else if (this.difficulty === Difficulty.Beginner && randomOutOfTen === 1) {
            // 10 % chance
            if (this.game.reserve.getCount() > cst.MINIMUM_EXCHANGE_RESERVE_COUNT) {
                const sliceIndex = Math.floor(Math.random() * rack.length);
                this.game.changeLetters(rack.slice(sliceIndex), cst.AI_ID);
            } else this.game.skipTurn(cst.AI_ID);
        } else {
            // 80 % chance
            const sortedWordOptions = this.chooseWords(rack);
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
        const bracket = this.getRandomPointBracket();
        return this.getPlayablePositions(freeLetters)
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

    private getPlayablePositions(rack: string[]): PlacementOption[] {
        const searchStack = this.getInitialStack(rack);
        const validPositions: PlacementOption[] = [];
        for (;;) {
            const head = searchStack.pop();
            if (!head) break;
            if (this.isValidPosition(head)) validPositions.push(new PlacementOption(head.isHorizontal, head.letters));
            if (!head.position.isInBound()) continue;
            const letter = this.board.get(head.position).letter;
            if (letter) {
                const nextNode = head.node.getNext(letter);
                if (!nextNode) continue;
                const nextPos = head.position.withOffset(head.isHorizontal, 1);
                searchStack.push({ ...head, position: nextPos, node: nextNode, contact: true });
            } else {
                this.searchNewLetter(searchStack, head);
            }
        }
        return validPositions;
    }

    private searchNewLetter(searchStack: SearchHead[], head: SearchHead) {
        const prefix = this.findPrefix(head.position, !head.isHorizontal);
        const nextPos = head.position.withOffset(head.isHorizontal, 1);
        [...new Set(head.rack)]
            .flatMap((l) => {
                if (l === '*') {
                    return prefix?.nextNodes.map((node) => node.letter) || cst.ALL_LETTERS;
                } else {
                    return [l];
                }
            })
            .forEach((nextLetter) => {
                const nextNode = head.node.getNext(nextLetter);
                if (!nextNode) return;
                if (prefix && !this.validSuffix(prefix, nextLetter, head.position, !head.isHorizontal)) return;
                const newRack = head.rack.slice();
                const idx = head.rack.findIndex((l) => l === nextLetter);
                newRack.splice(idx, 1);
                const newLetters: LetterPlacement[] = [...head.letters, { letter: nextLetter, position: head.position }];
                searchStack.push({ ...head, position: nextPos, node: nextNode, letters: newLetters, rack: newRack });
            });
    }

    private getInitialStack(rack: string[]): SearchHead[] {
        const isStart = !this.board.get(cst.MIDDLE).letter;
        const searchStack: SearchHead[] = [];
        if (isStart) {
            const isHorizontal = Math.random() > cst.HALF_PROBABILITY;
            searchStack.push({
                position: cst.MIDDLE,
                isHorizontal,
                letters: [],
                node: this.trie,
                contact: true,
                rack,
                startingPosition: cst.MIDDLE,
            });
        } else {
            for (let row = 0; row < cst.BOARD_LENGTH; row++) {
                for (let col = 0; col < cst.BOARD_LENGTH; col++) {
                    const pos = new Position(row, col);
                    // for each direction
                    for (const isHorizontal of [true, false]) {
                        let mightTouch = false;
                        for (let delta = -cst.HALF_LENGTH; delta <= cst.HALF_LENGTH; delta++) {
                            const pos = isHorizontal ? new Position(row, col + delta) : new Position(row + delta, col);
                            if (pos.isInBound() && this.board.get(pos).letter) mightTouch = true;
                        }
                        if (!mightTouch) continue;

                        const prevPos = pos.withOffset(isHorizontal, -1);
                        if (prevPos.isInBound() && this.board.get(prevPos).letter) continue;
                        searchStack.push({ position: pos, isHorizontal, letters: [], node: this.trie, contact: false, rack, startingPosition: pos });
                    }
                }
            }
        }
        return searchStack;
    }

    private findPrefix(position: Position, isHorizontal: boolean): LetterNode | undefined {
        const startingOffset = this.wordGetter.findStartingOffset(position, isHorizontal);
        if (startingOffset === 0) return undefined;
        let node: LetterNode = this.trie;
        for (let offset = startingOffset; offset < 0; offset++) {
            const pos = position.withOffset(isHorizontal, offset);
            const letter = this.board.get(pos).letter;
            if (!letter) throw new Error('Could backtrack but now stuck??');
            const nextNode = node.getNext(letter);
            if (!nextNode) throw new Error('Prefix is not a valid word??');
            node = nextNode;
        }
        return node;
    }

    private validSuffix(prefix: LetterNode, letter: string, position: Position, isHorizontal: boolean): boolean {
        let node = prefix.getNext(letter);
        if (!node) return false;
        for (let offset = 1; ; offset++) {
            const pos = position.withOffset(isHorizontal, offset);
            if (!pos.isInBound()) break;
            const nextLetter = this.board.get(pos).letter;
            if (!nextLetter) break;
            node = node.getNext(nextLetter);
            if (!node) return false;
        }
        return node.terminal;
    }

    private isValidPosition(head: SearchHead): boolean {
        const hasAdjacentLetter = head.position.isInBound() && this.board.get(head.position).letter;
        return !hasAdjacentLetter && head.letters.length > 0 && head.contact && head.node.terminal;
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
}
