import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Dictionnary } from '@app/classes/dictionnary';
import { Room } from '@app/classes/room';
import { JoinSetupDialogComponent } from '@app/components/join-setup-dialog/join-setup-dialog.component';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-joining-room-page',
    templateUrl: './joining-room-page.component.html',
    styleUrls: ['./joining-room-page.component.scss'],
})
export class JoiningRoomPageComponent implements OnInit {
    dictionnaries: Dictionnary[] | undefined = undefined;

    constructor(public dialog: MatDialog, public communicationService: CommunicationService, public location: Location) {}

    ngOnInit() {
        this.communicationService.dictionnaries.then((dictionnaries) => {
            this.dictionnaries = dictionnaries;
        });
    }

    openDialog(room: Room) {
        this.dialog.open(JoinSetupDialogComponent, {
            data: {
                room: room.id,
                name: room.mainPlayer.name,
                dictionnary: this.dictionnaries ? this.dictionnaries[room.parameters?.dictionnary || 0]?.name : '…',
            },
        });
    }
}
