import { Board } from './board';
import { Position } from './position';

export class PlacementOption {
    constructor(public isHorizontal: boolean, public newLetters: LetterPlacement[]) {}

    static newPlacement(board: Board, position: Position, isHorizontal: boolean, word: string): PlacementOption {
        const newLetters: LetterPlacement[] = [];
        const letters = [...word];
        for (let offset = 0; letters.length > 0; offset++) {
            const pos = position.withOffset(isHorizontal, offset);
            if (!pos.isInBound()) throw new Error('Placement invalide le mot ne rentre pas dans la grille');
            if (board.get(pos).letter) continue;
            newLetters.push({ letter: letters.shift()?.toUpperCase() as string, position: pos });
        }
        return new PlacementOption(isHorizontal, newLetters);
    }
}

export type LetterPlacement = {
    letter: string;
    position: Position;
};
