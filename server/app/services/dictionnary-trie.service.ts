import { LetterNode } from '@app/classes/letter-node';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { Service } from 'typedi';

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
    generateLeftParts(inputArr: string[], connectedLetter: string, allowedQuantity: number): string[][] {
        const validWords: string[][] = [];

        const permute = (remainingLetter: string[], attemptedPermutation: string[] = []) => {
            const qtyPermuted = inputArr.length - remainingLetter.length;
            if (qtyPermuted === allowedQuantity) {
                const completeLeftPart = attemptedPermutation.concat(connectedLetter);
                if (this.isValidBranching(completeLeftPart)) validWords.push(attemptedPermutation);
            }
            if (qtyPermuted <= allowedQuantity) {
                for (let i = 0; i < remainingLetter.length; i++) {
                    const copy = remainingLetter.slice();
                    const nextLetter = copy.splice(i, 1);
                    const nextPermutation = attemptedPermutation.concat(nextLetter);
                    if (this.isValidBranching(nextPermutation)) permute(copy, nextPermutation);
                }
            }
        };

        permute(inputArr);
        return this.removeDuplicates(validWords);
    }

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
            let different = true;
            finalArray.forEach((word) => {
                different = false;
                word.forEach((letter, index) => {
                    if (letter !== item[index]) {
                        different = true;
                        return;
                    }
                });
                if (!different) return;
            });

            if (different) {
                finalArray.push(item.slice());
            }
        });
        return finalArray;
    }
}
