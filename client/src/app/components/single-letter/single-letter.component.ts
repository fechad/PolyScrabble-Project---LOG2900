import { Component, OnInit } from '@angular/core';
import { alphabet } from '@app/services/Alphabet';

@Component({
    selector: 'app-single-letter',
    templateUrl: './single-letter.component.html',
    styleUrls: ['./single-letter.component.scss'],
})
export class SingleLetterComponent implements OnInit {
    alphabet = alphabet;
    selectedLetter = alphabet[Math.floor(Math.random() * alphabet.length)];

    constructor() {}

    ngOnInit(): void {}
}
