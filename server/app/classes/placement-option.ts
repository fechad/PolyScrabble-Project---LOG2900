import { WordConnection } from '@app/services/dictionnary-trie.service';

export class PlacementOption {
    score: number = 0;
    command: string = '';
    constructor(public row: number, public col: number, public isHorizontal: boolean, public word: string) {}
    deepCopy(newWord?: string): PlacementOption {
        return new PlacementOption(this.row, this.col, this.isHorizontal, newWord ? newWord : this.word);
    }
    buildCommand(connectedLetters: WordConnection[]) {
        const command = [...this.word];
        connectedLetters.forEach((letter) => {
            if (letter.isOnBoard) command[letter.index] = '';
        });
        this.command = command.reduce((formattedCommand, element) => {
            if (element !== '') return formattedCommand + element;
            else return formattedCommand;
        });
    }
}
