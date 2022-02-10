import { alphabetTemplate } from '@app/alphabet-template';
import { Letter } from '@app/letter';

export class Reserve {
    racks: Letter[][] = [];
    private reserve: Letter[] = [];

    constructor() {
        for (const letter of alphabetTemplate) {
            for (let i = 0; i < letter.quantity; i++) {
                this.reserve.push(letter);
            }
        }
        this.setRacks();
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

    private setRacks() {
        const rackLength = 7;
        let rack1: Letter[] = [];
        let rack2: Letter[] = [];
        for (let i = 0; i < rackLength; i++) {
            rack1 = rack1.concat(this.drawLetters(1));
            rack2 = rack2.concat(this.drawLetters(1));
        }
        this.racks.push(rack1);
        this.racks.push(rack2);
    }
}
