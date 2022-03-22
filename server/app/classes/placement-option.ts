import { WordConnection } from '@app/services/dictionnary-trie.service';

export class PlacementOption {
    score: number = 0;
    command: string = '';
    constructor(public row: number, public col: number, public isHorizontal: boolean, public word: string) {}
    deepCopy(newWord?: string): PlacementOption {
        return new PlacementOption(this.row, this.col, this.isHorizontal, newWord ? newWord : this.word);
    }

    buildCommand(connectedLetters: WordConnection[]) {
        const commandArray = [...this.word];
        connectedLetters
            .filter((letter) => letter.isOnBoard)
            .forEach((letter) => {
                commandArray[letter.index] = '';
            });
        this.command = commandArray.join('');
    }
}
