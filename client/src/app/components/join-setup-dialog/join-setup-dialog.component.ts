import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-join-setup-dialog',
    templateUrl: './join-setup-dialog.component.html',
    styleUrls: ['./join-setup-dialog.component.scss'],
})
export class JoinSetupDialogComponent implements OnInit {
    joiningRoomForm: FormGroup;

    constructor(private dialogRef: MatDialogRef<JoinSetupDialogComponent>, private formBuilder: FormBuilder, private router: Router, public communicationService: CommunicationService, @Inject(MAT_DIALOG_DATA) public data: any) {}

    ngOnInit(): void {
        this.joiningRoomForm = this.formBuilder.group({
            secondPlayerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
        });
    }

    onNoClick() {
        this.dialogRef.close();
    }

    async submit() {
        await this.communicationService.joinRoom(this.joiningRoomForm.value.secondPlayerName, this.data.room);
        this.dialogRef.close();
        this.router.navigate(['/waiting-room']);
    }
}
