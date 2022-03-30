export class GameTile {
    letter?: string | undefined;

    constructor(readonly multiplier: number, readonly wordMultiplier: number = 1) {}
}
