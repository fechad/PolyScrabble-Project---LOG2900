export class PlacementOption{
    constructor(public row: number, public col: number, public isHorizontal: boolean, public word: string) {}
    deepCopy(newWord?: string): PlacementOption {
        return new PlacementOption(this.row, this.col, this.isHorizontal, newWord ? newWord : this.word);
    }
};

