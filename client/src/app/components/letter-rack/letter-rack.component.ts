import { Component, OnInit } from '@angular/core';
import { Letter } from '@app/classes/letter';
import { GameContextService } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';

// const DELAY = 10;
@Component({
    selector: 'app-letter-rack',
    templateUrl: './letter-rack.component.html',
    styleUrls: ['./letter-rack.component.scss'],
})
export class LetterRackComponent implements OnInit {
    letters: Letter[];
    timeOut: number;
    constructor(public gameContextService: GameContextService, public gridService: GridService) {}

    ngOnInit(): void {
        this.gameContextService.rack.subscribe((newRack) => {
            this.letters = newRack;
        });
    }
    hideMenu() {
        const menu = document.getElementById('menu') as HTMLElement;
        menu.style.display = 'none';
    }

    menu(): void {
        window.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const menu = document.getElementById('menu') as HTMLElement;
            const letter = event.target as HTMLElement;
            if (menu.style.display === 'block') {
                this.hideMenu();
                letter.removeAttribute('id');
            } else {
                menu.style.display = 'block';
                letter.setAttribute('id', 'selected');
            }
        });
    }
}
