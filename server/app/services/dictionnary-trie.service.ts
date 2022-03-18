import { LetterNode } from '@app/classes/letter-node';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { Service } from 'typedi';

export type WordConnection = { connectedLetter?: string; index: number; isOnBoard: boolean };

@Service()
export class DictionnaryTrieService {
    dictionnaryTree: LetterNode = new LetterNode('*');
    perm: string[][];
    constructor(private dictionnary: DictionnaryService) {
        for (const word of this.dictionnary.dictionnaries[0].words) {
            let actualNode = this.dictionnaryTree;
            [...word].forEach((letter, i) => {
                actualNode = actualNode.addNext(letter);
                if (i === word.length - 1) actualNode.final = true;
            });
        }
    }

    generatePossibleWords(rack: string[], connections: WordConnection[]): string[] {
        const validWords: Set<string> = new Set();
        const permute = (remainingLetters: string[], attemptedPermutation: string = '', currentIndex: number = 0) => {
            if (currentIndex !== 0 && this.isValidBranching([...attemptedPermutation], true)) {
                validWords.add(attemptedPermutation);
            }
            const currentConnection = connections[currentIndex];
            if (attemptedPermutation.length === currentConnection.index) {
                if (currentConnection.connectedLetter === undefined) return;
                const nextPermutation = attemptedPermutation + currentConnection.connectedLetter;
                if (this.isValidBranching([...nextPermutation])) permute(remainingLetters, nextPermutation, currentIndex + 1);
            } else {
                for (let i = 0; i < remainingLetters.length; i++) {
                    const copy = remainingLetters.slice();
                    const nextLetter = copy.splice(i, 1);
                    const nextPermutation = attemptedPermutation + nextLetter[0].toLowerCase();
                    if (this.isValidBranching([...nextPermutation])) permute(copy, nextPermutation, currentIndex);
                }
            }
        };
        permute(rack);
        return [...validWords];
    }

    isValidBranching(permutation: string[], isFinal: boolean = false) {
        const finalNode = permutation.reduce((currentNode, letter) => currentNode?.getNext(letter), this.dictionnaryTree);
        return finalNode !== undefined && (!isFinal || finalNode.final);
    }
}
