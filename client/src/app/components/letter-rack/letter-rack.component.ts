import { Component, HostListener } from '@angular/core';
import { Letter } from '@app/classes/letter';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';

const MAX_LETTERS = 7;
const UNDEFINED = -1;

@Component({
    selector: 'app-letter-rack',
    templateUrl: './letter-rack.component.html',
    styleUrls: ['./letter-rack.component.scss'],
})
export class LetterRackComponent {
    letters: Letter[] = [];
    manipulating: number | undefined;
    exchanging: number[] = [];
    timeOut: number;
    previousSelection = UNDEFINED;

    constructor(public communicationService: CommunicationService, public gameContextService: GameContextService, public gridService: GridService) {
        this.gameContextService.rack.subscribe((newRack) => (this.letters = newRack));
    }
    @HostListener('document:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        const buttonPressed = event.key;
        if (event.target instanceof Element) {
            if (event.target.id === 'writingBox' || event.target.id === 'canvas') return;
        }
        if (buttonPressed === 'ArrowLeft' || buttonPressed === 'ArrowRight') this.shiftLetter(buttonPressed);
        else {
            const occurrences = this.checkOccurrences(buttonPressed);
            if (occurrences.length === 0) {
                this.manipulating = undefined;
            } else if (!this.manipulating?.toString() || !occurrences.includes(this.manipulating)) {
                this.manipulating = occurrences[0];
            } else {
                const idx = occurrences.indexOf(this.manipulating);
                const newIdx = (idx + 1) % occurrences.length;
                this.manipulating = occurrences[newIdx];
            }
        }
    }

    @HostListener('document:wheel', ['$event'])
    scrollDetect(e: WheelEvent) {
        this.shiftLetter(e.deltaY);
    }

    @HostListener('document:click', ['$event'])
    clear(e: MouseEvent) {
        const selection = e.target as HTMLElement;
        const parentPossibilities = [
            'name',
            'letter-name',
            'big-let',
            'small-let',
            'letter-container',
            'rack-container',
            'rackArea',
            'context-menu',
            'letter-rack',
            'letter-score',
            'big-sco',
            'small-sco',
            'score',
        ];
        const name = selection?.getAttribute('class') as string;

        if (!parentPossibilities.includes(name)) {
            this.manipulating = undefined;
            this.exchanging = [];
        }
    }

    checkOccurrences(key: string): number[] {
        const identicalLetters = this.letters.map((letter, idx) => {
            if (letter.name.toLowerCase() === key.toLowerCase()) return idx;
            else return UNDEFINED;
        });
        return identicalLetters.filter((value) => value !== UNDEFINED);
    }

    shiftLetter(keypress: string | number) {
        if (this.manipulating === undefined) return;
        let newIndex = UNDEFINED;

        if (keypress === 'ArrowRight' || keypress > 0) {
            newIndex = (this.manipulating + 1) % this.letters.length;
        } else if (keypress === 'ArrowLeft' || keypress < 0) {
            newIndex = (this.manipulating + this.letters.length - 1) % this.letters.length;
        }
        this.updateLetterList(newIndex, this.manipulating);
    }

    updateLetterList(index: number, oldIndex: number) {
        const temp = this.letters[oldIndex];
        this.letters[oldIndex] = this.letters[index];
        this.letters[index] = temp;
        this.manipulating = index;
    }

    manipulate(idx: number): void {
        if (this.exchanging.includes(idx)) return;
        this.manipulating = idx;
        this.exchanging = [];
    }

    select(e: Event, idx: number) {
        e.preventDefault();
        if (this.exchanging.includes(idx)) {
            const letter = this.exchanging.indexOf(idx);
            this.exchanging.splice(letter, 1);
        } else this.exchanging.push(idx);
        this.manipulating = undefined;
    }

    exchange() {
        const selectedLetters = this.exchanging.map((letter) => this.letters[letter].name.toLowerCase()).join('');
        this.communicationService.exchange(selectedLetters);
    }

    getReserveCount(): boolean {
        return this.gameContextService.state.value.reserveCount < MAX_LETTERS ? true : false;
    }
}
