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

export type PlacementScore = {
    placement: PlacementOption;
    score: number;
};

export class VirtualPlayer {
    id: string = cst.AI_ID;
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
            if (this.game.getCurrentPlayer().id !== this.id || alreadyPlaying) return;
            alreadyPlaying = true;
            await this.playTurn();
            alreadyPlaying = false;
        }, cst.DELAY_CHECK_TURN);
    }

    async playTurn() {
        let played = false;
        setTimeout(() => {
            if (!played) this.game.skipTurn(this.id);
            played = true;
        }, cst.DELAY_NO_PLACEMENT);
        const minTimeout = new Promise<void>((resolve) => setTimeout(() => resolve(), cst.BOARD_PLACEMENT_DELAY));
        const rack = this.game.reserve.letterRacks[this.game.players[cst.MAIN_PLAYER].id === this.id ? cst.MAIN_PLAYER : cst.OTHER_PLAYER];
        const changeLetters = async (length: number) => {
            await minTimeout;
            if (!played)
                this.game.changeLetters(
                    rack.slice(0, Math.min(this.game.reserve.getCount(), length)).map((letter) => letter.toLowerCase()),
                    this.id,
                );
            played = true;
        };
        const play = async (chosenWord: PlacementOption) => {
            const letters = chosenWord.newLetters.map((l) => l.letter);
            if (!played) await this.game.placeLetters(this.id, letters, chosenWord.newLetters[0].position, chosenWord.isHorizontal);
            played = true;
        };
        const randomOutOfTen = 1; // Math.floor(Math.random() * cst.PROBABILITY);
        if (this.difficulty === Difficulty.Expert) {
            const sortedWordOptions = this.chooseWords(rack);
            if (sortedWordOptions.length > 0) await play(sortedWordOptions[0].placement);
            else if (this.game.reserve.getCount() > 0) await changeLetters(rack.length);
        } else if (randomOutOfTen > 1) {
            // 80 % chance
            const bracket = this.getRandomPointBracket();
            const sortedWordOptions = this.chooseWords(rack, bracket);
            if (sortedWordOptions.length === 0) return;
            const randomIndex = Math.floor(Math.random() * sortedWordOptions.length);
            await play(sortedWordOptions[randomIndex].placement);
        } else if (randomOutOfTen === 1 && this.game.reserve.getCount() >= cst.RACK_LENGTH) {
            // 10 % chance
            const sliceIndex = Math.floor(Math.random() * rack.length + 1);
            await changeLetters(sliceIndex);
        }
    }

    chooseWords(freeLetters: string[], bracket?: cst.Braket): PlacementScore[] {
        return this.getPlayablePositions(freeLetters)
            .map((placement) => {
                const score = this.wordGetter.getWords(placement).reduce((totalScore, word) => totalScore + word.score, 0);
                return { placement, score };
            })
            .filter(
                (placement) => !bracket || (placement.score >= bracket[cst.LOWER_BOUND_INDEX] && placement.score <= bracket[cst.HIGHER_BOUND_INDEX]),
            )
            .sort((a, b) => b.score - a.score);
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
            .flatMap((l): [string, boolean][] => {
                if (l === '*') {
                    return prefix.nextNodes.map((node) => [node.letter, true]);
                } else {
                    return [[l, false]];
                }
            })
            .forEach(([nextLetter, isGlob]) => {
                const nextNode = head.node.getNext(nextLetter);
                if (!nextNode) return;
                if (!this.validSuffix(prefix, nextLetter, head.position, !head.isHorizontal)) return;
                const newRack = head.rack.slice();
                const idx = head.rack.findIndex((l) => l === (isGlob ? '*' : nextLetter));
                newRack.splice(idx, 1);
                const newLetters: LetterPlacement[] = [
                    ...head.letters,
                    { letter: isGlob ? nextLetter : nextLetter.toLowerCase(), position: head.position },
                ];
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
            });
        } else {
            for (let row = 0; row < cst.BOARD_LENGTH; row++) {
                for (let col = 0; col < cst.BOARD_LENGTH; col++) {
                    const position = new Position(row, col);
                    // for each direction
                    for (const isHorizontal of [true, false]) {
                        let mightTouch = false;
                        for (let delta = -cst.HALF_LENGTH; delta <= cst.HALF_LENGTH; delta++) {
                            const pos = isHorizontal ? new Position(row, col + delta) : new Position(row + delta, col);
                            if (pos.isInBound() && this.board.get(pos).letter) mightTouch = true;
                        }
                        if (!mightTouch) continue;

                        const prevPos = position.withOffset(isHorizontal, cst.PREVIOUS);
                        if (prevPos.isInBound() && this.board.get(prevPos).letter) continue;
                        searchStack.push({ position, isHorizontal, letters: [], node: this.trie, contact: false, rack });
                    }
                }
            }
        }
        return searchStack;
    }

    private findPrefix(position: Position, isHorizontal: boolean): LetterNode {
        const startingOffset = this.wordGetter.findStartingOffset(position, isHorizontal);
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
        let crossWord = prefix.letter !== '*';
        let node = prefix.getNext(letter);
        if (!node) return false;
        for (let offset = 1; ; offset++) {
            const pos = position.withOffset(isHorizontal, offset);
            if (!pos.isInBound()) break;
            const nextLetter = this.board.get(pos).letter;
            if (!nextLetter) break;
            crossWord = true;
            node = node.getNext(nextLetter);
            if (!node) return false;
        }
        return !crossWord || node.terminal;
    }

    private isValidPosition(head: SearchHead): boolean {
        const hasAdjacentLetter = head.position.isInBound() && this.board.get(head.position).letter;
        return !hasAdjacentLetter && head.letters.length > 0 && head.contact && head.node.terminal;
    }

    private getRandomPointBracket(): [number, number] {
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
