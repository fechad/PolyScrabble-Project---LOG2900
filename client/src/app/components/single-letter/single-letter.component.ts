import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-single-letter',
    templateUrl: './single-letter.component.html',
    styleUrls: ['./single-letter.component.scss'],
})
export class SingleLetterComponent implements OnInit {
    @Input()
    selectedLetter: string;

    constructor() {}

    ngOnInit(): void {}
}
