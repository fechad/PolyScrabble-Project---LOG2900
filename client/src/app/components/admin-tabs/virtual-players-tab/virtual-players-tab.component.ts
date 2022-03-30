import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddPlayerDialogComponent } from '@app/components/add-player-dialog/add-player-dialog.component';
import { faSync, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

type VP = {
    default: boolean;
    beginner: boolean;
    name: string;
};
@Component({
    selector: 'app-virtual-players-tab',
    templateUrl: './virtual-players-tab.component.html',
    styleUrls: ['./virtual-players-tab.component.scss'],
})
export class VirtualPlayersTabComponent implements OnInit {
    faTrash = faTrashAlt;
    faRefresh = faSync;
    list: VP[];
    beginnerList: VP[];
    expertList: VP[];
    clicked: boolean = false;
    clickedExpert: boolean = false;
    nameInput: string = '';

    constructor(readonly httpClient: HttpClient, private readonly dialog: MatDialog) {}

    async ngOnInit(): Promise<void> {
        this.updateList();
    }

    async updateList(): Promise<void> {
        this.beginnerList = [];
        this.expertList = [];
        this.list = await this.httpClient.get<VP[]>(`${environment.serverUrl}/vp-names`).toPromise();
        for (const vp of this.list) {
            if (vp.beginner) {
                this.beginnerList.push(vp);
            } else this.expertList.push(vp);
        }
        console.log(this.beginnerList);
    }

    async addPlayer(name: string, beginner: boolean) {
        if (name.trim() === '') return;
        const newVp: VP = { default: false, beginner, name };
        await this.httpClient.post<VP>(`${environment.serverUrl}/vp-names`, newVp).toPromise();
        this.updateList();
        console.log(newVp);

        if (beginner) this.clicked = false;
        else this.clickedExpert = false;
    }

    async deletePlayer(name: string) {
        await this.httpClient.delete<VP>(`${environment.serverUrl}/vp-names/${name}`).toPromise();
        this.updateList();
    }

    openDialog() {
        this.dialog.open(AddPlayerDialogComponent);
    }

    createInput(isBeginner: boolean) {
        if (isBeginner) this.clicked = true;
        else this.clickedExpert = true;
    }
}
