import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Room } from '@app/classes/room';
import { JoinSetupDialogComponent } from '@app/components/join-setup-dialog/join-setup-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { MenusStatesService } from '@app/services/menus-states.service';

@Component({
    selector: 'app-joining-room-page',
    templateUrl: './joining-room-page.component.html',
    styleUrls: ['./joining-room-page.component.scss'],
})
export class JoiningRoomPageComponent {
    constructor(public dialog: MatDialog, public state: MenusStatesService, public communicationService: CommunicationService) {}

    openDialog(room: Room) {
        this.dialog.open(JoinSetupDialogComponent, {
            data: {
                room: room.id,
            },
        });
    }
}
