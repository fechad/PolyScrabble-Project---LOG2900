import { Component, OnChanges, OnInit } from '@angular/core';
import { Letter } from '@app/services/Alphabet';
import { GameContextService } from '@app/services/game-context.service';

const DELAY = 10;
@Component({
    selector: 'app-letter-rack',
    templateUrl: './letter-rack.component.html',
    styleUrls: ['./letter-rack.component.scss'],
})
export class LetterRackComponent implements OnInit, OnChanges {
    letters: Letter[];
    timeOut: number;
    constructor(public gameContextService: GameContextService) {
        // console.log(gameContextService.letterRack.getValue());
        // this.gameContextService.letterRackCast.subscribe((newLetters) => {
        //     console.log(newLetters);
        //     this.letters = newLetters;
        // });
    }

    ngOnInit(): void {
        this.gameContextService.getRackObs().subscribe((newRack) => {
            this.letters = newRack;
            this.timeOut = window.setTimeout(() => {}, DELAY);
        });
    }

    ngOnChanges(): void {
        window.clearTimeout(this.timeOut);
    }
}
