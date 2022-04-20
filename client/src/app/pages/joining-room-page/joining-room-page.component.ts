import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Dictionnary } from '@app/classes/dictionnary';
import { Room } from '@app/classes/room';
import { JoinSetupDialogComponent } from '@app/components/join-setup-dialog/join-setup-dialog.component';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-joining-room-page',
    templateUrl: './joining-room-page.component.html',
    styleUrls: ['./joining-room-page.component.scss'],
})
export class JoiningRoomPageComponent {
    dictionnaries: Dictionnary[] | undefined;
    rooms: Room[];
    log2990: boolean;

    constructor(public dialog: MatDialog, communicationService: CommunicationService, location: ActivatedRoute) {
        this.log2990 = location.snapshot.url[0].toString() === 'joining-room-log2990';
        communicationService.rooms?.subscribe((rooms) => (this.rooms = rooms.filter((room) => room.parameters.log2990 === this.log2990)));
        communicationService.dictionnaries.subscribe((dictionnaries) => {
            this.dictionnaries = dictionnaries;
        });
    }

    getDictTitle(room: Room): string {
        return this.dictionnaries?.find((dictionary) => dictionary.id === (room.parameters?.dictionnary || 0))?.title || '…';
    }

    openDialog(room: Room) {
        this.dialog.open(JoinSetupDialogComponent, {
            data: {
                room: room.id,
                name: room.mainPlayer.name,
                dictionnary: this.getDictTitle(room),
                timer: room.parameters.timer,
            },
        });
    }

    getRandomRoom() {
        const randomIndex = Math.floor(Math.random() * this.rooms.length);
        this.openDialog(this.rooms[randomIndex]);
    }
}
