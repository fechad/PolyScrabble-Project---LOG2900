import { Component, OnInit } from '@angular/core';
import { letters } from '@app/services/Alphabet';
@Component({
    selector: 'app-letter-rack',
    templateUrl: './letter-rack.component.html',
    styleUrls: ['./letter-rack.component.scss'],
})
export class LetterRackComponent implements OnInit {
    letters = letters;
    constructor() {}

    ngOnInit(): void {}
}
