import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { Letter } from '@app/classes/letter';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';

// const DELAY = 10;
@Component({
    selector: 'app-letter-rack',
    templateUrl: './letter-rack.component.html',
    styleUrls: ['./letter-rack.component.scss'],
})
export class LetterRackComponent implements OnInit, AfterViewInit {
    letters: Letter[];
    timeOut: number;
    selectedLetters: string = '';
    constructor(
        public communicationService: CommunicationService,
        public gameContextService: GameContextService,
        public gridService: GridService,
        private elementRef: ElementRef,
    ) {
        this.gameContextService.state.subscribe(() => {});
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

    clearSelection() {
        const container = document.getElementsByClassName('letter-container');
        Array.from(container).forEach((letters) => {
            if (letters.id === 'selected') {
                letters.removeAttribute('id');
            }
        });

        this.hideMenu();
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
                this.clearSelection();
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
        return this.gameContextService.state.value.reserveCount < 7 ? true : false;
    }
}
