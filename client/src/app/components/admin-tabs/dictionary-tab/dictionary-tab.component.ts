import { Component } from '@angular/core';
import { faSync, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-dictionary-tab',
    templateUrl: './dictionary-tab.component.html',
    styleUrls: ['./dictionary-tab.component.scss'],
})
export class DictionaryTabComponent {
    faTrash = faTrashAlt;
    faRefresh = faSync;
}
