import { Board } from './board';
import { Position } from './position';

export class PlacementOption {
    constructor(public isHorizontal: boolean, public newLetters: LetterPlacement[]) {}

    static newPlacement(board: Board, position: Position, isHorizontal: boolean, letters: string[]): PlacementOption {
        const newLetters: LetterPlacement[] = [];
        for (let offset = 0, idx = 0; idx < letters.length; offset++) {
            const pos = position.withOffset(isHorizontal, offset);
            if (!pos.isInBound()) throw new Error('Placement invalide: Le mot ne rentre pas dans la grille');
            if (board.get(pos).letter) continue;
            newLetters.push({ letter: letters[idx].toUpperCase() as string, position: pos });
            idx++;
        }
        return new PlacementOption(isHorizontal, newLetters);
    }
}

export type LetterPlacement = {
    letter: string;
    position: Position;
};
