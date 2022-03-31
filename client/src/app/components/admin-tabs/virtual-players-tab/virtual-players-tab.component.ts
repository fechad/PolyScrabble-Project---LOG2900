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
    nameInputExpert: string = '';
    error: string = '';
    errorExpert: string = '';

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
        if (this.list.find((vp) => vp.name.toLowerCase() === name.toLowerCase())) {
            if (beginner) this.error = 'Un des joueurs virtuels détient déjà ce nom, veuillez en choisir un autre.';
            else this.errorExpert = 'Un des joueurs virtuels détient déjà ce nom, veuillez en choisir un autre.';
            return;
        }
        await this.httpClient.post<VP>(`${environment.serverUrl}/vp-names`, newVp).toPromise();
        this.updateList();
        this.hideInput(beginner);
    }

    async deletePlayer(name: string) {
        await this.httpClient.delete<VP>(`${environment.serverUrl}/vp-names/${name}`).toPromise();
        this.updateList();
    }

    hideInput(beginner: boolean) {
        if (beginner) {
            this.nameInput = '';
            this.error = '';
            this.clicked = false;
        } else {
            this.nameInputExpert = '';
            this.errorExpert = '';
            this.clickedExpert = false;
        }
    }
    openDialog() {
        this.dialog.open(AddPlayerDialogComponent);
    }
}
