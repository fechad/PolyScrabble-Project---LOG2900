import * as cst from '@app/constants';

export class Position {
    constructor(readonly row: number, readonly col: number) {}

    withOffset(isHorizontal: boolean, offset: number): Position {
        const row = this.row + (isHorizontal ? 0 : offset);
        const col = this.col + (isHorizontal ? offset : 0);
        return new Position(row, col);
    }

    isInBound(): boolean {
        return this.row >= 0 && this.row < cst.BOARD_LENGTH && this.col >= 0 && this.col < cst.BOARD_LENGTH;
    }

    equals(other: Position): boolean {
        return this.row === other.row && this.col === other.col;
    }
}
