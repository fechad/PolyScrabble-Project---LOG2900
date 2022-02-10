import { Component, OnInit } from '@angular/core';
import { GameContextService } from '@app/services/game-context.service';
@Component({
    selector: 'app-letter-rack',
    templateUrl: './letter-rack.component.html',
    styleUrls: ['./letter-rack.component.scss'],
})
export class LetterRackComponent implements OnInit {
    constructor(public gameContextService: GameContextService) {
        // console.log(gameContextService.letterRack.getValue());
        // this.gameContextService.letterRackCast.subscribe((newLetters) => {
        //     console.log(newLetters);
        //     this.letters = newLetters;
        // });
    }

    ngOnInit(): void {}
}
