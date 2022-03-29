import { ALPHABET } from '@app/alphabet-template';
import * as cst from '@app/constants';
import { MAIN_PLAYER, OTHER_PLAYER } from '@app/constants';

export type Letter = string;

export class Reserve {
    letterRacks: [Letter[], Letter[]];
    private reserve: Letter[];

    constructor() {
        this.reserve = [];
        Object.entries(ALPHABET).forEach(([letter, info]) => {
            for (let i = 0; i < info.quantity; i++) {
                this.reserve.push(letter);
            }
        });
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

    updateReserve(lettersToChange: string[], isMainPlayer: boolean, putBack: boolean) {
        const playerIndex = isMainPlayer ? MAIN_PLAYER : OTHER_PLAYER;
        const rack = this.letterRacks[playerIndex];

        for (const unwantedLetter of lettersToChange) {
            const i = rack.findIndex((letter) => unwantedLetter === letter.toLowerCase() || (unwantedLetter.match(/[A-Z]/g) && letter === '*'));
            if (i === cst.UNDEFINED) throw new Error('Tried to remove letter that is not in rack');
            if (putBack) this.reserve.push(rack[i]);
            rack[i] = rack[rack.length - 1];
            rack.pop();
        }
        rack.push(...this.drawLetters(lettersToChange.length));
    }

    matchRack(rack: Letter[], isMainPlayer: boolean): void {
        const playerIndex = isMainPlayer ? MAIN_PLAYER : OTHER_PLAYER;
        rack.forEach((letter, idx) => {
            this.letterRacks[playerIndex][idx] = letter;
        });
    }

    getCount(): number {
        return this.reserve.length;
    }

    isPlayerRackEmpty(player: number): boolean {
        return this.letterRacks[player].every((letter) => !letter);
    }

    getContent() {
        const reserveToShow: { [letter: string]: number } = Object.fromEntries(Object.keys(ALPHABET).map((letter) => [letter, 0]));
        for (const letter of this.reserve) {
            reserveToShow[letter]++;
        }
        return reserveToShow;
    }

    private setRacks() {
        const rackLength = 7;
        const rack1: string[] = [];
        const rack2: string[] = [];
        for (let i = 0; i < rackLength; i++) {
            rack1.push(...this.drawLetters(1));
            rack2.push(...this.drawLetters(1));
        }
        this.letterRacks = [rack1, rack2];
    }
}
