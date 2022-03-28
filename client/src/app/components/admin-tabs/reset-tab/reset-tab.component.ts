import { Component, OnInit } from '@angular/core';
import { faUndoAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-reset-tab',
    templateUrl: './reset-tab.component.html',
    styleUrls: ['./reset-tab.component.scss'],
})
export class ResetTabComponent implements OnInit {
    faReset = faUndoAlt;
    constructor() {}

    ngOnInit(): void {}
}
