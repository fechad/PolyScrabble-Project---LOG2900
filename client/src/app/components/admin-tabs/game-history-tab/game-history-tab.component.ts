import { Component, OnInit } from '@angular/core';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-game-history-tab',
    templateUrl: './game-history-tab.component.html',
    styleUrls: ['./game-history-tab.component.scss'],
})
export class GameHistoryTabComponent implements OnInit {
    faTrash = faTrashAlt;

    constructor() {}

    ngOnInit(): void {}
}
