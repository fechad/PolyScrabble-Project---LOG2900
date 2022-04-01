import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faSync, faTrashAlt, faUpload } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

type DbDictionary = { name: string; description: string; words?: string[] };

@Component({
    selector: 'app-dictionary-tab',
    templateUrl: './dictionary-tab.component.html',
    styleUrls: ['./dictionary-tab.component.scss'],
})
export class DictionaryTabComponent implements OnInit {
    faTrash = faTrashAlt;
    faRefresh = faSync;
    faUpload = faUpload;
    list: DbDictionary[];
    uploading: boolean = false;
    error: string = '';
    dictionaryForm: FormGroup;
    newWords: string[];
    constructor(readonly httpClient: HttpClient, private formBuilder: FormBuilder) {}

    async ngOnInit(): Promise<void> {
        this.updateList();
        this.dictionaryForm = this.formBuilder.group({
            name: new FormControl('', [Validators.required, Validators.pattern('^[A-zÀ-ù]*$')]),
            description: new FormControl('', [Validators.required]),
            file: new FormControl('', [Validators.required]),
        });
    }

    async updateList(): Promise<void> {
        this.list = [];
        this.list = await this.httpClient.get<DbDictionary[]>(`${environment.serverUrl}/dictionaries`).toPromise();
    }

    async transformToArrayList(e: Event) {
        const target = e.target as HTMLInputElement;
        const newFile = (target.files as FileList)[0];
        const reader = new FileReader();
        reader.onload = () => {
            const content = reader.result as string;
            const obj = JSON.parse(content);
            console.log(obj, typeof obj);
            this.newWords = obj.words;
            console.log(this.newWords);
        };
        reader.readAsText(newFile);
    }

    async addDictionary() {
        const newDictionnary: DbDictionary = {
            name: this.dictionaryForm.value.name,
            description: this.dictionaryForm.value.description,
            words: this.newWords,
        };
        await this.httpClient.post<DbDictionary>(`${environment.serverUrl}/dictionaries`, newDictionnary).toPromise();
        this.updateList();
    }

    async deleteDictionary(name: string) {
        await this.httpClient.delete<DbDictionary>(`${environment.serverUrl}/dictionaries/${name}`).toPromise();
        this.updateList();
    }

    findDoubles(nameToFind: string): boolean {
        if (this.list.find((dictionary) => dictionary.name.toLowerCase() === nameToFind.toLowerCase())) {
            this.error = 'Un des dictionnaires détient déjà ce nom, veuillez en choisir un autre.';
            return true;
        }
        return false;
    }

    emptyForm() {
        this.uploading = false;
        for (const key of Object.keys(this.dictionaryForm.controls)) {
            this.dictionaryForm.controls[key].reset();
        }
    }

    onSubmit() {
        for (const key of Object.keys(this.dictionaryForm.controls)) {
            if (!this.dictionaryForm.controls[key].valid) {
                return;
            }
        }
        this.addDictionary();
        this.emptyForm();
    }
}
