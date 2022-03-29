import { Component } from '@angular/core';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-virtual-players-tab',
    templateUrl: './virtual-players-tab.component.html',
    styleUrls: ['./virtual-players-tab.component.scss'],
})
export class VirtualPlayersTabComponent {
    faTrash = faTrashAlt;
}
