import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faDownload, faPencilAlt, faSync, faTrashAlt, faUpload } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

export type DbDictionary = { id: number; title: string; description: string; words?: string[] };

type DbDictionary = { id: number; name: string; description: string; words: string[] };

@Component({
    selector: 'app-dictionary-tab',
    templateUrl: './dictionary-tab.component.html',
    styleUrls: ['./dictionary-tab.component.scss'],
})
export class DictionaryTabComponent implements OnInit {
    faTrash = faTrashAlt;
    faRefresh = faSync;
    faUpload = faUpload;
    faDownload = faDownload;
    faPencil = faPencilAlt;
    list: DbDictionary[];
    uploading: boolean = false;
    editing: boolean = false;
    error: string = '';
    uploadStatus: string;
    dictionaryForm: FormGroup;
    newWords: string[];
    oldTitle: string;
    newDictionnary: DbDictionary;
    fileDownloaded: string;
    environment = environment;

    constructor(readonly httpClient: HttpClient, private formBuilder: FormBuilder) {}

    async ngOnInit(): Promise<void> {
        this.updateList();
        this.dictionaryForm = this.formBuilder.group({
            id: new FormControl(''),
            title: new FormControl('', [Validators.pattern('^[A-zÀ-ù]*$')]),
            description: new FormControl(''),
            file: new FormControl('', [Validators.required]),
        });
    }

    async updateList(): Promise<void> {
        this.list = [];
        this.list = await this.httpClient.get<DbDictionary[]>(`${environment.serverUrl}/dictionaries`).toPromise();
    }

    createNewDbDictionary(): DbDictionary {
        let lastDicoId = this.list[this.list.length - 1].id;
        this.newDictionnary = {
            id: lastDicoId === 0 ? 1 : (lastDicoId += 1),
            title: this.dictionaryForm.value.title,
            description: this.dictionaryForm.value.description,
            words: this.newWords,
        };
        return this.newDictionnary;
    }

    getFileInfos(e: Event) {
        const target = e.target as HTMLInputElement;
        const newFile = (target.files as FileList)[0];
        const reader = new FileReader();
        reader.onload = () => {
            const content = reader.result as string;
            try {
                const obj = JSON.parse(content);
                if (this.validateDictionary(obj.title, obj.description, obj.words)) {
                    this.newWords = obj.words;
                    this.dictionaryForm.value.title = obj.title;
                    this.dictionaryForm.value.description = obj.description;
                    this.createNewDbDictionary();
                } else throw new Error();
            } catch (error) {
                this.error = 'Veuillez choisir un fichier de format JSON contenant un titre, une description et une liste de mots.';
                this.dictionaryForm.controls.file.reset();
            }
        };
        reader.readAsText(newFile);
    }

    validateDictionary(title: string, description: string, words: string[]): boolean {
        const validTitle = title !== '' && title !== undefined;
        const validDescription = description !== '' && description !== undefined;
        return validTitle && validDescription && this.validateDictionaryWords(words);
    }

    validateDictionaryWords(words: string[]): boolean {
        for (const word of words) {
            if (word.includes(' ') || !word.match(/[A-zÀ-ù]/g)) return false;
            if (word.length > 15) return false;
        }
        return true;
    }

    async addDictionary() {
        this.uploadStatus = '';
        this.uploadStatus = await this.httpClient.post<string>(`${environment.serverUrl}/dictionaries`, this.newDictionnary).toPromise();
        this.updateList();
    }

    async deleteDictionary(id: string) {
        await this.httpClient.delete<DbDictionary>(`${environment.serverUrl}/dictionaries/${id}`).toPromise();
        this.updateList();
    }

    async deleteAll() {
        await this.httpClient.delete(`${environment.serverUrl}/dictionaries-reset`).toPromise();
        this.updateList();
    }

    async updateDictionary() {
        const newTitle = this.dictionaryForm.value.title;
        if (newTitle.trim() === '' || this.findDoubles(newTitle)) return;
        const oldDictionary = this.list.find((d) => d.title === this.oldTitle);
        if (!oldDictionary) throw new Error();
        const newDictionary: DbDictionary = { id: oldDictionary.id, title: newTitle, description: this.dictionaryForm.value.description };
        await this.httpClient.patch<DbDictionary>(`${environment.serverUrl}/dictionaries`, { oldDictionary, newDictionary }).toPromise();
        this.updateList();
        this.editing = false;
    }

    async downloadDictionary(id: string) {
        await this.httpClient.get(`${environment.serverUrl}/dictionaries/download/${id}`).toPromise();
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
        this.error = '';
        for (const key of Object.keys(this.dictionaryForm.controls)) {
            this.dictionaryForm.controls[key].reset();
        }
        this.newWords = [];
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
