import { Component } from '@angular/core';
import { MenusStatesService } from '@app/services/menus-states.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['../../styles/menus.scss'],
})
export class MainPageComponent {
    constructor(public state: MenusStatesService) {}
    // sendTimeToServer() {
    //     throw new Error('Method not implemented.');
    // }
    // getMessagesFromServer() {
    //     throw new Error('Method not implemented.');
    // }
}
