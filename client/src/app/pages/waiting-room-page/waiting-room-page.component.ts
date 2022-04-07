import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Dictionnary } from '@app/classes/dictionnary';
import { SoloDialogComponent } from '@app/components/solo-dialog/solo-dialog.component';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent {
    canControl: boolean;
    isMainPlayer: boolean;
    otherPlayerName: string | undefined;
    dictionnaries: Dictionnary[] | undefined;
    log2990: boolean;

    constructor(public communicationService: CommunicationService, public matDialog: MatDialog, route: ActivatedRoute) {
        this.log2990 = route.snapshot.url[0].toString() === '2990';
        this.communicationService.selectedRoom.subscribe(async (room) => {
            this.isMainPlayer = this.communicationService.getId()?.value === room?.mainPlayer.id;
            this.otherPlayerName = room?.otherPlayer?.name;

            const hasOtherPlayer = room?.otherPlayer !== undefined;
            this.canControl = hasOtherPlayer && this.isMainPlayer;
        });

        this.communicationService.dictionnaries.then((dictionnaries) => {
            this.dictionnaries = dictionnaries;
        });
    }

    openSoloDialog() {
        if (this.communicationService.selectedRoom.value) {
            this.matDialog.open(SoloDialogComponent, {
                data: {
                    name: this.communicationService.selectedRoom.value.mainPlayer.name,
                    dictionnary: this.dictionnaries
                        ? this.dictionnaries[this.communicationService.selectedRoom.value.parameters?.dictionnary || 0]?.name
                        : '…',
                    timer: this.communicationService.selectedRoom.value.parameters.timer,
                    log2990: this.log2990,
                },
            });
        } else {
            this.matDialog.open(SoloDialogComponent, { data: { log2990: this.log2990 } });
        }
    }
}
