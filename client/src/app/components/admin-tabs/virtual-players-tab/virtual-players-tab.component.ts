import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { faSync, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

export type VP = {
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
    list: VP[] = [];
    beginnerList: VP[];
    expertList: VP[];
    clicked: boolean[] = [false, false];
    nameInput: string = '';
    nameInputExpert: string = '';
    error: [boolean, string] = [true, ''];

    constructor(readonly httpClient: HttpClient) {}

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
    }

    async addPlayer(name: string, beginner: boolean) {
        if (name.trim() === '' || this.findDoubles(name, beginner) || this.invalidName(name, beginner)) return;
        const newVp: VP = { default: false, beginner, name };
        await this.httpClient.post<VP>(`${environment.serverUrl}/vp-names`, newVp).toPromise();
        this.updateList();
        this.hideInput(beginner);
    }

    async updatePlayer(oldName: string, newName: string, beginner: boolean) {
        if (newName.trim() === '' || this.findDoubles(newName, beginner) || this.invalidName(newName, beginner)) return;
        const oldVp = this.list.find((vp) => vp.name === oldName);
        const newVp: VP = { default: false, beginner, name: newName };
        await this.httpClient.patch<VP>(`${environment.serverUrl}/vp-names`, { oldVp, newVp }).toPromise();
        this.updateList();
        this.hideInput(beginner);
    }

    async deletePlayer(name: string) {
        await this.httpClient.delete<VP>(`${environment.serverUrl}/vp-names/${name}`).toPromise();
        this.updateList();
    }

    async deleteAll() {
        await this.httpClient.delete(`${environment.serverUrl}/vp-names-reset`).toPromise();
        this.updateList();
    }

    invalidName(name: string, beginner: boolean): boolean {
        if (name.match(/[^A-zÀ-û]/g) || name.match(/[_]/g)) {
            this.error = [beginner, 'Les caractères doivent être des lettres seulement.'];
            return true;
        }
        return false;
    }

    findDoubles(nameToFind: string, beginner: boolean): boolean {
        if (this.list.find((vp) => vp.name.toLowerCase() === nameToFind.toLowerCase())) {
            this.error = [beginner, 'Un des joueurs virtuels détient déjà ce nom, veuillez en choisir un autre.'];
            return true;
        }
        return false;
    }

    hideInput(beginner: boolean) {
        if (beginner) {
            this.clicked[0] = false;
            this.nameInput = '';
        } else {
            this.clicked[1] = false;
            this.nameInputExpert = '';
        }
        this.error = [beginner, ''];
    }
}
