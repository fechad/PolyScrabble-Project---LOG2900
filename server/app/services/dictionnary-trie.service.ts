import { LetterNode } from '@app/classes/letter-node';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { Service } from 'typedi';

export type WordConnection = { connectedLetter?: string; allowedQuantity: number };

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
    generatePossibleWords(inputArr: string[], connections: WordConnection[]): string[][] {
        const validWords: string[][] = [];

        const permute = (remainingLetter: string[], attemptedPermutation: string[] = [], currentIndex: number = 0) => {
            const qtyPermuted = inputArr.length - remainingLetter.length;
            let connection = connections[currentIndex];
            if (qtyPermuted === connection.allowedQuantity) {
                attemptedPermutation =
                    connection.connectedLetter === undefined ? attemptedPermutation : attemptedPermutation.concat(connection.connectedLetter);
                if (this.isValidBranching(attemptedPermutation)) {
                    validWords.push(attemptedPermutation);
                    currentIndex++;
                    connection = connections[currentIndex];
                    console.log(connection);
                    if (!connection) return;
                }
            }
            if (qtyPermuted <= connection.allowedQuantity) {
                for (let i = 0; i < remainingLetter.length; i++) {
                    const copy = remainingLetter.slice();
                    const nextLetter = copy.splice(i, 1);
                    const nextPermutation = attemptedPermutation.concat(nextLetter);
                    if (this.isValidBranching(nextPermutation)) permute(copy, nextPermutation, currentIndex);
                }
            }
        };

        permute(inputArr);
        return this.removeDuplicates(validWords);
    }

    // generateRightParts(partialWord: string[], allowedQuantity: number, otherConnection?: string) {
    //     // if (otherConnection) {
    //     // }
    // }

    isValidBranching(permutation: string[]) {
        let validation = true;
        let currentNode: LetterNode | undefined = this.dictionnaryTree;
        permutation.forEach((letter) => {
            if (currentNode === undefined) {
                validation = false;
                return;
            }
            currentNode = currentNode.getNext(letter);
        });
        return validation && currentNode !== undefined;
    }

    removeDuplicates(initialArray: string[][]) {
        const finalArray: string[][] = [];
        initialArray.forEach((item) => {
            let isUniqueElement = true;
            finalArray.forEach((word) => {
                let isSameWord = true;
                word.forEach((letter, index) => {
                    if (letter !== item[index]) {
                        isSameWord = false;
                        return;
                    }
                });
                if (isSameWord) {
                    isUniqueElement = false;
                    return;
                }
            });

            if (isUniqueElement) {
                finalArray.push(item.slice());
            }
        });
        return finalArray;
    }
}
