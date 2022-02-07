import { alphabetTemplate } from '@app/alphabet-template';
import { Letter } from '@app/letter';

export class Reserve {
    rack1: Letter[] = [];
    rack2: Letter[] = [];
    private reserve: Letter[] = [];

    constructor() {
        for (const letter of alphabetTemplate) {
            for (let i = 0; i < letter.quantity; i++) {
                this.reserve.push(letter);
            }
        }
        this.setRacks();
    }

    setRacks() {
        const rackLength = 7;
        for (let i = 0; i < rackLength; i++) {
            this.rack1 = this.rack1.concat(this.drawLetters(1));
            this.rack2 = this.rack2.concat(this.drawLetters(1));
        }
    }

    drawLetters(quantity: number): Letter[] {
        const lettersToSend: Letter[] = [];
        for (let i = 0; i < quantity; i++) {
            const listLength: number = this.reserve.length - 1;
            const index: number = Math.floor(Math.random() * listLength); // random number from array
            lettersToSend.push(this.reserve[index]);
            // remove chosen element
            this.reserve[index] = this.reserve[listLength];
            this.reserve.pop();
        }
        return lettersToSend;
    }
}
