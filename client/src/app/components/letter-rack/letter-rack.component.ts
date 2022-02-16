import { Component, OnInit } from '@angular/core';
import { Letter } from '@app/classes/letter';
import { GameContextService } from '@app/services/game-context.service';

// const DELAY = 10;
@Component({
    selector: 'app-letter-rack',
    templateUrl: './letter-rack.component.html',
    styleUrls: ['./letter-rack.component.scss'],
})
export class LetterRackComponent implements OnInit {
    letters: Letter[];
    timeOut: number;
    constructor(public gameContextService: GameContextService) {}

    ngOnInit(): void {
        this.gameContextService.rack.subscribe((newRack) => {
            this.letters = newRack;
        });
    }
}
