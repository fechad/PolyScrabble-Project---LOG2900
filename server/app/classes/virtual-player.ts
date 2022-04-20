import { LetterPlacement, PlacementOption } from '@app/classes/placement-option';
import * as constants from '@app/constants';
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
    id: string = constants.AI_ID;
    private board: Board;
    private wordGetter: WordGetter;

    constructor(readonly difficulty: Difficulty, private game: Game, private trie: LetterNode) {
        this.board = game.board;
        this.wordGetter = new WordGetter(this.board);
        console.log(`Joueur virtuel de niveau ${difficulty === Difficulty.Beginner ? 'débutant' : 'expert'} pour la partie ${game.id}`);
    }

    waitForTurn() {
        let alreadyPlaying = false;
        const waitTurnInterval = setInterval(async () => {
            if (this.game.room.getState() !== State.Started) clearInterval(waitTurnInterval);
            if (this.game.getCurrentPlayer().id !== this.id || alreadyPlaying) return;
            alreadyPlaying = true;
            await this.playTurn();
            alreadyPlaying = false;
        }, constants.DELAY_CHECK_TURN);
    }

    async playTurn() {
        let played = false;
        setTimeout(() => {
            if (!played) this.game.skipTurn(this.id);
            played = true;
        }, constants.DELAY_NO_PLACEMENT);
        const minTimeout = new Promise<void>((resolve) => setTimeout(() => resolve(), constants.BOARD_PLACEMENT_DELAY));
        const rack =
            this.game.reserve.letterRacks[this.game.players[constants.MAIN_PLAYER].id === this.id ? constants.MAIN_PLAYER : constants.OTHER_PLAYER];
        const changeLetters = async (length: number) => {
            await minTimeout;
            if (played) return;
            played = true;
            this.game.changeLetters(
                rack.slice(0, Math.min(this.game.reserve.getCount(), length)).map((letter) => letter.toLowerCase()),
                this.id,
            );
        };
        const play = async (chosenWord: PlacementOption) => {
            const letters = chosenWord.newLetters.map((l) => l.letter);
            if (played) return;
            played = true;
            await this.game.placeLetters(this.id, letters, chosenWord.newLetters[0].position, chosenWord.isHorizontal);
        };
        const randomOutOfTen = Math.floor(Math.random() * constants.PROBABILITY);
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
        } else if (randomOutOfTen === 1 && this.game.reserve.getCount() >= constants.RACK_LENGTH) {
            // 10 % chance
            const sliceIndex = Math.floor(Math.random() * rack.length + 1);
            await changeLetters(sliceIndex);
        }
    }

    chooseWords(freeLetters: string[], bracket?: constants.Bracket): PlacementScore[] {
        return this.getPlayablePositions(freeLetters)
            .map((placement) => {
                const score = this.wordGetter.getWords(placement).reduce((totalScore, word) => totalScore + word.score, 0);
                return { placement, score };
            })
            .filter(
                (placement) =>
                    !bracket || (placement.score >= bracket[constants.LOWER_BOUND_INDEX] && placement.score <= bracket[constants.HIGHER_BOUND_INDEX]),
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
            .flatMap((letter): [string, boolean][] => {
                if (letter === '*') {
                    return prefix.nextNodes.map((node) => [node.letter, true]);
                } else {
                    return [[letter, false]];
                }
            })
            .forEach(([nextLetter, isGlobal]) => {
                const nextNode = head.node.getNext(nextLetter);
                if (!nextNode) return;
                if (!this.validSuffix(prefix, nextLetter, head.position, !head.isHorizontal)) return;
                const newRack = head.rack.slice();
                const index = head.rack.findIndex((letter) => letter === (isGlobal ? '*' : nextLetter));
                newRack.splice(index, 1);
                const newLetters: LetterPlacement[] = [
                    ...head.letters,
                    { letter: isGlobal ? nextLetter : nextLetter.toLowerCase(), position: head.position },
                ];
                searchStack.push({ ...head, position: nextPos, node: nextNode, letters: newLetters, rack: newRack });
            });
    }

    private getInitialStack(rack: string[]): SearchHead[] {
        const searchStack: SearchHead[] = [];
        if (!this.board.get(constants.MIDDLE).letter) {
            const isHorizontal = Math.random() > constants.HALF_PROBABILITY;
            searchStack.push({
                position: constants.MIDDLE,
                isHorizontal,
                letters: [],
                node: this.trie,
                contact: true,
                rack,
            });
        } else {
            for (let row = 0; row < constants.BOARD_LENGTH; row++) {
                for (let col = 0; col < constants.BOARD_LENGTH; col++) {
                    const position = new Position(row, col);
                    // for each direction
                    for (const isHorizontal of [true, false]) {
                        let connectableWord = false;
                        for (let delta = -constants.HALF_LENGTH; delta <= constants.HALF_LENGTH; delta++) {
                            const pos = isHorizontal ? new Position(row, col + delta) : new Position(row + delta, col);
                            if (pos.isInBound() && this.board.get(pos).letter) connectableWord = true;
                        }
                        if (!connectableWord) continue;

                        const prevPos = position.withOffset(isHorizontal, constants.PREVIOUS);
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
            if (!letter) throw new Error('Aucune option de recherche');
            const nextNode = node.getNext(letter);
            if (!nextNode) throw new Error('Préfixe invalide');
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
        const randomOutOfTen = Math.floor(Math.random() * constants.PROBABILITY);
        if (randomOutOfTen < constants.PROBABILITY_OF_40) {
            // 40 % chance
            return constants.LOWER_POINT_BRACKET;
        } else if (randomOutOfTen < constants.PROBABILITY_OF_30) {
            // 30 % chance
            return constants.MIDDLE_POINT_BRACKET;
        } else {
            // 30 % chance
            return constants.HIGHER_POINT_BRACKET;
        }
    }
}
