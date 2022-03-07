import { Component, HostListener, OnInit } from '@angular/core';
import { Letter } from '@app/classes/letter';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';

const MAX_LETTERS = 7;
const LETTER_CONTAINER = document.getElementsByClassName('letter-container');
const LIMIT = 6;
const UNDEFINED = -1;
@Component({
    selector: 'app-letter-rack',
    templateUrl: './letter-rack.component.html',
    styleUrls: ['./letter-rack.component.scss'],
})
export class LetterRackComponent implements OnInit {
    letters: Letter[];
    timeOut: number;
    selectedLetters: string = '';
    buttonPressed: string | undefined;
    prevKey: string | undefined;
    previousSelection = UNDEFINED;
    constructor(public communicationService: CommunicationService, public gameContextService: GameContextService, public gridService: GridService) {
        this.gameContextService.state.subscribe(() => {
            return;
        });
    }
    @HostListener('document:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;

        if (!(document.getElementById('writingBox') === document.activeElement)) {
            if (this.buttonPressed === 'ArrowLeft' || this.buttonPressed === 'ArrowRight') {
                this.shiftLetter(this.buttonPressed);
            } else {
                this.clearSelection('manipulate');
                this.clearSelection('exchange');
                let index = 0;
                const occurrences = this.checkOccurrences(this.buttonPressed);

                if (this.prevKey !== this.buttonPressed) this.previousSelection = UNDEFINED;

                for (const letter of this.letters) {
                    if (letter.name.toLowerCase() === this.buttonPressed.toLowerCase() && this.previousSelection < index) {
                        this.previousSelection = index;
                        this.setToManipulate(this.buttonPressed?.toLowerCase(), index);

                        if (this.previousSelection === occurrences[occurrences.length - 1]) {
                            this.previousSelection = UNDEFINED;
                        }

                        break;
                    }
                    index++;
                }

                this.prevKey = this.buttonPressed;
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
            this.clearSelection('exchange');
            this.clearSelection('manipulate');
        }
    }

    ngOnInit(): void {
        this.gameContextService.rack.subscribe((newRack) => {
            this.letters = newRack;
        });
    }

    checkOccurrences(key: string): number[] {
        const indices = [];
        let index = 0;
        for (const letter of this.letters) {
            if (letter.name.toLowerCase() === key.toLowerCase()) {
                indices.push(index);
            }
            index++;
        }
        return indices;
    }

    shiftLetter(keypress: string | number) {
        let index = 0;

        const tempRack = this.letters.map((x) => x);
        Array.from(LETTER_CONTAINER).forEach((letters) => {
            if (letters.getAttribute('id') === 'manipulating') {
                if ((keypress === 'ArrowRight' || keypress > 0) && index !== LIMIT) {
                    tempRack[index + 1] = this.letters[index];
                    tempRack[index] = this.letters[index + 1];
                    this.letters = tempRack;
                } else if ((keypress === 'ArrowRight' || keypress > 0) && index === LIMIT) {
                    this.letters.pop();
                    this.letters.unshift(tempRack[index]);
                } else if ((keypress === 'ArrowLeft' || keypress < 0) && index !== 0) {
                    tempRack[index - 1] = this.letters[index];
                    tempRack[index] = this.letters[index - 1];
                    this.letters = tempRack;
                } else {
                    this.letters.shift();
                    this.letters.push(tempRack[index]);
                }
            }
            index++;
        });
    }

    setToManipulate(letter: string, idx: number) {
        let selection = false;
        let index = 0;
        Array.from(LETTER_CONTAINER).forEach((letters) => {
            if (letters.firstChild?.firstChild?.textContent?.toLowerCase() === letter && idx === index && !selection) {
                letters.setAttribute('id', 'manipulating');
                selection = true;
            }
            index++;
        });
    }

    manipulate(event: Event): void {
        const tile = event.target as HTMLElement;

        if (
            !(
                tile.parentElement?.parentElement?.getAttribute('id') === 'selected' ||
                tile.parentElement?.getAttribute('id') === 'selected' ||
                tile.getAttribute('id') === 'selected'
            )
        ) {
            this.clearSelection('manipulate');
            this.clearSelection('exchange');
            tile.parentElement?.parentElement?.setAttribute('id', 'manipulating');
            this.checkSelection();
        }
    }

    hideMenu() {
        const menu = document.getElementById('menu') as HTMLElement;
        menu.style.display = 'none';
    }

    menu(event: Event): void {
        event.preventDefault();
        const menu = document.getElementById('menu') as HTMLElement;
        const letter = event.target as HTMLElement;

        if (letter.parentElement?.parentElement?.id === 'selected') {
            letter.parentElement?.parentElement?.removeAttribute('id');
        } else {
            menu.style.display = 'block';
            letter.parentElement?.parentElement?.setAttribute('id', 'selected');
            this.clearSelection('manipulate');
        }

        this.checkSelection();
    }

    clearSelection(command: string) {
        Array.from(LETTER_CONTAINER).forEach((letters) => {
            if (command === 'exchange' && letters.id === 'selected') {
                letters.removeAttribute('id');
            } else if (command === 'manipulate' && letters.id === 'manipulating') {
                letters.removeAttribute('id');
            }
        });
        if (command === 'exchange') this.hideMenu();
    }

    checkSelection() {
        let itemSelected = false;

        Array.from(LETTER_CONTAINER).forEach((letters) => {
            if (letters.id === 'selected') itemSelected = true;
        });

        if (!itemSelected) this.hideMenu();
    }

    exchange() {
        this.getSelectedLetters();
        this.communicationService.exchange(this.selectedLetters);
        this.selectedLetters = '';
    }

    getSelectedLetters() {
        Array.from(LETTER_CONTAINER).forEach((letters) => {
            const letterList = letters as HTMLElement;
            if (letters.id === 'selected') this.selectedLetters += letterList.innerText[0].toLowerCase();
        });
    }

    getReserveCount(): boolean {
        return this.gameContextService.state.value.reserveCount < MAX_LETTERS ? true : false;
    }
}
