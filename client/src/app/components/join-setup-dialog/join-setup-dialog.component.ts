import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Room } from '@app/classes/room';
import { CommunicationService } from '@app/services/communication.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-join-setup-dialog',
    templateUrl: './join-setup-dialog.component.html',
    styleUrls: ['../../styles/dialogs.scss'],
})
export class JoinSetupDialogComponent implements OnInit {
    joiningRoomForm: FormGroup;
    selectedRoom: Observable<Room>;

    constructor(
        public dialogRef: MatDialogRef<JoinSetupDialogComponent>,
        private formBuilder: FormBuilder,
        public communicationService: CommunicationService,
        @Inject(MAT_DIALOG_DATA) public data: { room: number; name: string; dictionnary: string; timer: number },
    ) {
        this.selectedRoom = this.communicationService.rooms.pipe(map((rooms) => rooms[this.data.room]));
    }

    ngOnInit(): void {
        this.joiningRoomForm = this.formBuilder.group({
            secondPlayerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    async submit() {
        for (const key of Object.keys(this.joiningRoomForm.controls)) {
            if (!this.joiningRoomForm.controls[key].valid) {
                return;
            }
        }
        this.communicationService.joinRoom(this.joiningRoomForm.value.secondPlayerName, this.data.room);
        this.dialogRef.close();
    }
}
