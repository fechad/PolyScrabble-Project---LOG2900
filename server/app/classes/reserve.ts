import { alphabetTemplate } from '@app/alphabet-template';
import * as cst from '@app/constants';
import { MAIN_PLAYER, OTHER_PLAYER } from '@app/constants';
import { Letter } from '@app/letter';
import { ReserveLetter } from '@app/reserve-letter';

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
        const rack = this.letterRacks[playerIndex];

        for (const unwantedLetter of lettersToChange) {
            const i = rack.findIndex(
                (letter) => unwantedLetter === letter.name.toLowerCase() || (unwantedLetter.match(/[A-Z]/g) && letter.name.match(/[*]/g)),
            );
            if (i !== cst.UNDEFINED) continue;
            if (putBack) this.reserve.push(rack[i]);
            rack[i] = rack[rack.length - 1];
            rack.pop();
        }
        rack.push(...this.drawLetters(lettersToChange.length));
    }

    matchRack(rack: Letter[], isMainPlayer: boolean) {
        const playerIndex = isMainPlayer ? MAIN_PLAYER : OTHER_PLAYER;
        rack.forEach((letter, idx) => {
            this.letterRacks[playerIndex][idx] = letter;
        });
    }

    getCount() {
        return this.reserve.length;
    }

    isPlayerRackEmpty(player: number): boolean {
        return this.letterRacks[player].every((letter) => !letter);
    }

    getContent() {
        const reserveToShow: ReserveLetter[] = alphabetTemplate.map((letter) => ({ name: letter.name, qtyInReserve: 0 }));
        for (const content of this.reserve) {
            reserveToShow[content.id - 1].qtyInReserve++;
        }
        return reserveToShow;
    }

    private setRacks() {
        const rackLength = 7;
        const rack1: Letter[] = [];
        const rack2: Letter[] = [];
        for (let i = 0; i < rackLength; i++) {
            rack1.push(...this.drawLetters(1));
            rack2.push(...this.drawLetters(1));
        }
        this.letterRacks.push(rack1);
        this.letterRacks.push(rack2);
    }
}
