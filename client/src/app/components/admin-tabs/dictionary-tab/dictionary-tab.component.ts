import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { faSync, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

type DbDictionary = { id: number; name: string; description: string; words: string[] };

@Component({
    selector: 'app-dictionary-tab',
    templateUrl: './dictionary-tab.component.html',
    styleUrls: ['./dictionary-tab.component.scss'],
})
export class DictionaryTabComponent implements OnInit {
    faTrash = faTrashAlt;
    faRefresh = faSync;
    list: DbDictionary[];

    constructor(readonly httpClient: HttpClient) {}

    async ngOnInit(): Promise<void> {
        this.updateList();
    }

    async updateList(): Promise<void> {
        this.list = [];
        this.list = await this.httpClient.get<DbDictionary[]>(`${environment.serverUrl}/dictionaries`).toPromise();
        console.log(this.list);
    }
}
