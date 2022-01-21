import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-classic-multiplayer-dialog',
    templateUrl: './classic-multiplayer-dialog.component.html',
    styleUrls: ['./classic-multiplayer-dialog.component.scss'],
})
export class ClassicMultiplayerDialogComponent implements OnInit {
    gameParametersForm: FormGroup;
    constructor(
        private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<ClassicMultiplayerDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: unknown,
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
        this.gameParametersForm = this.formBuilder.group({
            playerName: [],
            timer: [],
            dictionary: [],
        });
    }

    // function to avoid having turn time limit at 00:00
    checkNonZero() {
        const minute = document.getElementById('minutes') as HTMLSelectElement;
        const second = document.getElementById('seconds') as HTMLSelectElement;

        const selectedMin = minute?.options[minute?.selectedIndex].text;
        if (selectedMin === '0') {
            second.selectedIndex = 1;
        }
    }
}
