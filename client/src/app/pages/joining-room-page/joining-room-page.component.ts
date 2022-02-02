import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JoinSetupDialogComponent } from '@app/components/join-setup-dialog/join-setup-dialog.component';
import { CommunicationService, Room } from '@app/services/communication.service';

@Component({
    selector: 'app-joining-room-page',
    templateUrl: './joining-room-page.component.html',
    styleUrls: ['./joining-room-page.component.scss'],
})
export class JoiningRoomPageComponent implements OnInit {
    constructor(public dialog: MatDialog, public communicationService: CommunicationService) {}

    ngOnInit(): void {}

    openDialog(room: Room) {
        this.dialog.open(JoinSetupDialogComponent, {
            data: {
                room: room.id,
            }
        });
    }
}
