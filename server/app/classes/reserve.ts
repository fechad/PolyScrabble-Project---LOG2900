import { alphabetTemplate } from '@app/alphabet-template';
import { Letter } from '@app/letter';
import { ReserveLetter } from '@app/reserve-letter';
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
        const pullableQuantity = this.reserve.length > quantity ? quantity : this.reserve.length;
        for (let i = 0; i < pullableQuantity; i++) {
            const index: number = Math.floor(Math.random() * this.reserve.length); // random number from array
            lettersToSend.push(this.reserve[index]);
            // remove chosen element
            this.reserve[index] = this.reserve[this.reserve.length - 1];
            this.reserve.pop();
        }
        return lettersToSend;
    }

    updateReserve(lettersToChange: string, isMainPlayer: boolean, putBack: boolean) {
        const playerIndex = isMainPlayer ? MAIN_PLAYER : OTHER_PLAYER;

        for (const unwantedLetter of lettersToChange) {
            const listLength = this.letterRacks[playerIndex].length - 1;
            for (let i = 0; i <= listLength; i++) {
                if (
                    unwantedLetter === this.letterRacks[playerIndex][i].name.toLowerCase() ||
                    (unwantedLetter.match(/[A-Z]/g) && this.letterRacks[playerIndex][i].name.match(/[*]/g))
                ) {
                    if (putBack) {
                        this.reserve.push(this.letterRacks[playerIndex][i]);
                    }
                    this.letterRacks[playerIndex][i] = this.letterRacks[playerIndex][listLength];
                    this.letterRacks[playerIndex].pop();
                    break;
                }
            }
        }
        this.letterRacks[playerIndex] = this.letterRacks[playerIndex].concat(this.drawLetters(lettersToChange.length));
    }

    getCount() {
        return this.reserve.length;
    }

    isPlayerRackEmpty(player: number): boolean {
        for (const letter of this.letterRacks[player]) {
            if (letter !== undefined) return false;
        }
        return true;
    }

    getContent() {
        const reserveToShow: ReserveLetter[] = [];
        for (const letter of alphabetTemplate) {
            const letterToShow: ReserveLetter = { name: letter.name, qtyInReserve: 0 };
            reserveToShow.push(letterToShow);
        }
        for (const content of this.reserve) {
            reserveToShow[content.id - 1].qtyInReserve++;
        }
        return reserveToShow;
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
