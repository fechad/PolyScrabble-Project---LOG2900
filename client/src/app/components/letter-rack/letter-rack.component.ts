import { Component, OnInit } from '@angular/core';
import { Letter } from '@app/services/Alphabet';
import { GameContextService } from '@app/services/game-context.service';
@Component({
    selector: 'app-letter-rack',
    templateUrl: './letter-rack.component.html',
    styleUrls: ['./letter-rack.component.scss'],
})
export class LetterRackComponent implements OnInit {
    letters: Letter[];
    constructor(public gameContextService: GameContextService) {}

    ngOnInit(): void {
        this.gameContextService.letterRack.subscribe((newLetters) => (this.letters = newLetters));
    }
}
