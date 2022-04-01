import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faPencilAlt, faSync, faTrashAlt, faUpload } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

type DbDictionary = { title: string; description: string; words?: string[] };

@Component({
    selector: 'app-dictionary-tab',
    templateUrl: './dictionary-tab.component.html',
    styleUrls: ['./dictionary-tab.component.scss'],
})
export class DictionaryTabComponent implements OnInit {
    faTrash = faTrashAlt;
    faRefresh = faSync;
    faUpload = faUpload;
    faPencil = faPencilAlt;
    list: DbDictionary[];
    uploading: boolean = false;
    editing: boolean = false;
    error: string = '';
    dictionaryForm: FormGroup;
    newWords: string[];
    oldTitle: string;
    constructor(readonly httpClient: HttpClient, private formBuilder: FormBuilder) {}

    async ngOnInit(): Promise<void> {
        this.updateList();
        this.dictionaryForm = this.formBuilder.group({
            title: new FormControl('', [Validators.pattern('^[A-zÀ-ù]*$')]),
            description: new FormControl(''),
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
            this.newWords = obj.words;
            this.dictionaryForm.value.title = obj.title;
            this.dictionaryForm.value.description = obj.description;
        };
        reader.readAsText(newFile);
    }

    async addDictionary() {
        const newDictionnary: DbDictionary = {
            title: this.dictionaryForm.value.title,
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

    async updateDictionary() {
        const newTitle = this.dictionaryForm.value.title;
        // if (newTitle === '') return;
        const oldDict = this.list.find((d) => d.title === this.oldTitle);
        if (!oldDict) throw new Error();
        const newDict: DbDictionary = { title: newTitle, description: this.dictionaryForm.value.description };
        await this.httpClient.patch<DbDictionary>(`${environment.serverUrl}/dictionaries`, { oldDict, newDict }).toPromise();
        this.updateList();
        this.editing = false;
    }

    findDoubles(nameToFind: string): boolean {
        if (this.list.find((dictionary) => dictionary.title.toLowerCase() === nameToFind.toLowerCase())) {
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
        this.newWords = [];
    }

    invalidName(name: string): boolean {
        if (!name.match(/[A-zÀ-ù]/g)) {
            this.error = 'Les caractères doivent être des lettres seulement.';

            return true;
        }
        return false;
    }

    onSubmit() {
        if (this.findDoubles(this.dictionaryForm.value.title)) return;
        for (const key of Object.keys(this.dictionaryForm.controls)) {
            if (!this.dictionaryForm.controls[key].valid) {
                return;
            }
        }
        this.addDictionary();
        this.emptyForm();
    }
}
