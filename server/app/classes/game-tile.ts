export class GameTile {
    letter?: string | undefined;

    constructor(readonly multiplier: number, readonly wordMultiplier: number = 1) {}

    getChar(): string {
        if (!this.letter) throw new Error('Tried to get letter of empty tile');
        return this.letter;
    }
}
