import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
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
        private router: Router,
        public communicationService: CommunicationService,
        @Inject(MAT_DIALOG_DATA) public data: { room: number },
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
        await this.communicationService.joinRoom(this.joiningRoomForm.value.secondPlayerName, this.data.room);
        this.dialogRef.close();
        this.router.navigate(['/waiting-room']);
    }
}
