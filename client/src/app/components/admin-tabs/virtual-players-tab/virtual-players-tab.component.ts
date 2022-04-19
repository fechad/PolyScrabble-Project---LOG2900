import { HttpClient } from '@angular/common/http';
import { AfterContentChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VP } from '@app/classes/virtual-player';
import * as constant from '@app/constants';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-virtual-players-tab',
    templateUrl: './virtual-players-tab.component.html',
    styleUrls: ['./virtual-players-tab.component.scss'],
})
export class VirtualPlayersTabComponent implements OnInit, AfterContentChecked {
    @ViewChild('text') private text: ElementRef;
    @ViewChild('scrollMe') private scroller: ElementRef;
    @ViewChild('textExpert') private textExpert: ElementRef;
    @ViewChild('scrollMeExpert') private scrollerExpert: ElementRef;

    faTrash = faTrashAlt;
    list: VP[] = [];
    beginnerList: VP[];
    expertList: VP[];
    clicked: boolean[] = [false, false];
    nameInput: string = '';
    nameInputExpert: string = '';
    error: [boolean, string] = [true, ''];

    constructor(readonly httpClient: HttpClient, private snackbar: MatSnackBar, private detectChanges: ChangeDetectorRef) {}

    async ngOnInit(): Promise<void> {
        this.updateList();
    }

    ngAfterContentChecked() {
        this.detectChanges.detectChanges();
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
        const response = await this.httpClient.post(`${environment.serverUrl}/vp-names`, newVp, { responseType: 'text' }).toPromise();
        this.updateList();
        this.hideInput(beginner);
        this.snackbar.open(response, 'OK', { duration: 2000, panelClass: ['snackbar'] });
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

    clicking(isAdding: boolean, isBeginner: boolean) {
        if (isAdding && isBeginner) {
            this.addPlayer(this.nameInput, true);
        } else if (isAdding) {
            this.addPlayer(this.nameInputExpert, false);
        }

        if (isBeginner)
            setTimeout(() => {
                this.scroller.nativeElement.scrollTop = this.scroller.nativeElement.scrollHeight;
                this.text.nativeElement.focus();
            }, constant.RENDERING_DELAY);
        else {
            setTimeout(() => {
                this.scrollerExpert.nativeElement.scrollTop = this.scroller.nativeElement.scrollHeight;
                this.textExpert.nativeElement.focus();
            }, constant.RENDERING_DELAY);
        }
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

    async confirmReset() {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr?',
            text: 'Vous vous apprêtez à réinitialiser tous les joueurs virtuels.',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non',
            heightAuto: false,
        });

        if (!result.value) return;
        if (result.isConfirmed) {
            this.deleteAll();
        }
    }
}
