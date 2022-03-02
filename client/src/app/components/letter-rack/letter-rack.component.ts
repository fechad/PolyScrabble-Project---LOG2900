import { AfterViewInit, Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Letter } from '@app/classes/letter';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';

const MAX_LETTERS = 7;
@Component({
    selector: 'app-letter-rack',
    templateUrl: './letter-rack.component.html',
    styleUrls: ['./letter-rack.component.scss'],
})
export class LetterRackComponent implements OnInit, AfterViewInit {
    letters: Letter[];
    timeOut: number;
    selectedLetters: string = '';
    buttonPressed: string | undefined;
    previousSelection: number;
    constructor(
        public communicationService: CommunicationService,
        public gameContextService: GameContextService,
        public gridService: GridService,
        private elementRef: ElementRef,
    ) {
        this.gameContextService.state.subscribe(() => {
            return;
        });
    }
    @HostListener('document:keydown', ['$event'])
    @HostListener('document:wheel', ['$event'])
    buttonDetect(event: KeyboardEvent | undefined) {
        // e.preventDefault();
        this.buttonPressed = event?.key;
        console.log('event');
        if (this.buttonPressed === 'ArrowLeft' || this.buttonPressed === 'ArrowRight') {
            this.shiftLetter(this.buttonPressed);
        } else {
            this.clearSelection('manipulate');
            let index = 0;
            for (const letter of this.letters) {
                if (letter.name.toLowerCase() === this.buttonPressed?.toLowerCase()) {
                    if (this.previousSelection !== index) {
                        this.previousSelection = index;
                        this.setToManipulate(this.buttonPressed?.toLowerCase(), index);
                        break;
                    }
                }
                index++;
            }
        }
    }

    shiftLetter(keypress: string) {
        const container = document.getElementsByClassName('letter-container');
        let index = 0;
        const tempRack = this.letters.map((x) => x);
        Array.from(container).forEach((letters) => {
            if (letters.getAttribute('id') === 'manipulating') {
                const letterToSwap: Letter = {
                    name: letters.firstChild?.firstChild?.textContent!,
                    score: Number(letters.lastChild?.firstChild?.textContent),
                };
                if (keypress === 'ArrowRight' && index !== this.letters.length - 1) {
                    tempRack[index + 1] = letterToSwap;
                    tempRack[index] = this.letters[index + 1];
                    this.letters = tempRack;
                } else if (keypress === 'ArrowRight' && index === this.letters.length - 1) {
                    this.letters.pop();
                    this.letters.unshift(tempRack[index]);
                } else if (keypress === 'ArrowLeft' && index !== 0) {
                    tempRack[index - 1] = letterToSwap;
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
        const container = document.getElementsByClassName('letter-container');
        let selection = false;
        let counter = 0;
        Array.from(container).forEach((letters) => {
            if (letters.firstChild?.firstChild?.textContent?.toLowerCase() === letter && idx === counter) {
                if (!selection) {
                    letters.setAttribute('id', 'manipulating');
                    selection = true;
                }
            }
            counter++;
        });
    }

    manipulate(event: Event): void {
        const tile = event.target as HTMLElement;
        if (tile.parentElement?.parentElement?.getAttribute('id') === 'selected') {
            return;
        }
        this.clearSelection('manipulate');
        tile.parentElement?.parentElement?.setAttribute('id', 'manipulating');
        this.checkSelection();
    }

    ngOnInit(): void {
        this.gameContextService.rack.subscribe((newRack) => {
            this.letters = newRack;
        });
    }

    ngAfterViewInit() {
        this.elementRef.nativeElement.querySelector('#letter-container')?.addEventListener('contextmenu', this.menu.bind(this));
    }
    hideMenu() {
        const menu = document.getElementById('menu') as HTMLElement;
        menu.style.display = 'none';
    }

    menu(event: Event): void {
        event.preventDefault();
        const menu = document.getElementById('menu') as HTMLElement;
        const letter = event.target as HTMLElement;
        letter.parentElement?.parentElement?.parentElement?.focus();

        if (letter.parentElement?.parentElement?.id === 'selected') {
            letter.parentElement?.parentElement?.removeAttribute('id');
        } else {
            menu.style.display = 'block';
            letter.parentElement?.parentElement?.setAttribute('id', 'selected');
        }

        this.checkSelection();
    }

    clearSelection(command: string) {
        const container = document.getElementsByClassName('letter-container');
        Array.from(container).forEach((letters) => {
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
        window.addEventListener('click', (e) => {
            const selection = e.target as HTMLElement;
            const parentPossibilities = [
                'name',
                'letter-name',
                'letter-container',
                'rack-container',
                'rackArea',
                'context-menu',
                'app-letter-rack',
                'letter-score',
                'score',
            ];
            const name = selection?.getAttribute('class') as string;

            if (!parentPossibilities.includes(name)) {
                this.clearSelection('exchange');
                this.clearSelection('manipulate');
            }
        });

        const container = document.getElementsByClassName('letter-container');
        Array.from(container).forEach((letters) => {
            if (letters.id === 'selected') {
                itemSelected = true;
            }
        });

        if (!itemSelected) this.hideMenu();
    }

    exchange() {
        this.getSelectedLetters();
        this.communicationService.exchange(this.selectedLetters);
        this.selectedLetters = '';
    }
    getSelectedLetters() {
        const container = document.getElementsByClassName('letter-container');
        Array.from(container).forEach((letters) => {
            const letterList = letters as HTMLElement;
            if (letters.id === 'selected') {
                this.selectedLetters += letterList.innerText[0].toLowerCase();
            }
        });
    }

    getReserveCount(): boolean {
        return this.gameContextService.state.value.reserveCount < MAX_LETTERS ? true : false;
    }
}
