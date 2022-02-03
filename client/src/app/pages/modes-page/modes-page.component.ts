import { Component } from '@angular/core';
import { MenusStatesService } from '@app/services/menus-states.service';

@Component({
    selector: 'app-modes-page',
    templateUrl: './modes-page.component.html',
    styleUrls: ['../../styles/menus.scss'],
})
export class ModesPageComponent {
    constructor(public state: MenusStatesService) {}
}
