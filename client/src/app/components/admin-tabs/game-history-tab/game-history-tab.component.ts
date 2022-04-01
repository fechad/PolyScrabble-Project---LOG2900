import { Component } from '@angular/core';
import { faSync, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-game-history-tab',
    templateUrl: './game-history-tab.component.html',
    styleUrls: ['./game-history-tab.component.scss'],
})
export class GameHistoryTabComponent {
    faTrash = faTrashAlt;
    faRefresh = faSync;
}
