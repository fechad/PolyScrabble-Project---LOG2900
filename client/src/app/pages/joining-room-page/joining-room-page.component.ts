import { Location } from "@angular/common";
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Room } from '@app/classes/room';
import { JoinSetupDialogComponent } from '@app/components/join-setup-dialog/join-setup-dialog.component';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-joining-room-page',
    templateUrl: './joining-room-page.component.html',
    styleUrls: ['./joining-room-page.component.scss'],
})
export class JoiningRoomPageComponent {
    constructor(public dialog: MatDialog, public communicationService: CommunicationService, public location: Location) {}

    openDialog(room: Room) {
        this.dialog.open(JoinSetupDialogComponent, {
            data: {
                room: room.id,
            },
        });
    }
}
