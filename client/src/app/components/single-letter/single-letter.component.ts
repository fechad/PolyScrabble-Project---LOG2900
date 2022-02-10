import { Component, Input, OnInit } from '@angular/core';
import { Letter } from '@app/services/Alphabet';

@Component({
    selector: 'app-single-letter',
    templateUrl: './single-letter.component.html',
    styleUrls: ['./single-letter.component.scss'],
})
export class SingleLetterComponent implements OnInit {
    @Input()
    selectedLetter: Letter;
    constructor() {}

    ngOnInit(): void {}
}
