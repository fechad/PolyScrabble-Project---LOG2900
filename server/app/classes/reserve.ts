import { alphabetTemplate } from '@app/alphabet-template';
import { Letter } from '@app/letter';
import { MAIN_PLAYER, OTHER_PLAYER } from './game';

export class Reserve {
    letterRacks: Letter[][] = [];
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

    updateReserve(unwantedLetters: string, isMainPlayer: boolean) {
        const index = isMainPlayer ? MAIN_PLAYER : OTHER_PLAYER;

        for (const unwantedLetter of unwantedLetters) {
            const listLength = this.letterRacks[index].length - 1;
            for (let i = 0; i <= listLength; i++) {
                if (unwantedLetter === this.letterRacks[index][i].name.toLowerCase()) {
                    this.reserve.push(this.letterRacks[index][i]);
                    this.letterRacks[index][i] = this.letterRacks[index][listLength];
                    this.letterRacks[index].pop();
                    break;
                }
            }
        }
        this.letterRacks[index] = this.letterRacks[index].concat(this.drawLetters(unwantedLetters.length));
    }

    private setRacks() {
        const rackLength = 7;
        let rack1: Letter[] = [];
        let rack2: Letter[] = [];
        for (let i = 0; i < rackLength; i++) {
            rack1 = rack1.concat(this.drawLetters(1));
            rack2 = rack2.concat(this.drawLetters(1));
        }
        this.letterRacks.push(rack1);
        this.letterRacks.push(rack2);
    }
}
