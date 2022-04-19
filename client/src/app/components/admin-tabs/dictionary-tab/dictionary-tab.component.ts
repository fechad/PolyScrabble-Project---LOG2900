import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DbDictionary } from '@app/classes/dictionnary';
import { BOARD_SIZE } from '@app/constants';
import { faDownload, faPencilAlt, faTrashAlt, faUpload } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-dictionary-tab',
    templateUrl: './dictionary-tab.component.html',
    styleUrls: ['./dictionary-tab.component.scss'],
})
export class DictionaryTabComponent implements OnInit {
    faTrash = faTrashAlt;
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
    oldDescription: string;
    newDictionnary: DbDictionary;
    fileDownloaded: string;
    environment = environment;

    constructor(readonly httpClient: HttpClient, private formBuilder: FormBuilder, private snackbar: MatSnackBar) {}

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

    async getFileInfos(event: Event) {
        const target = event.target as HTMLInputElement;
        const newFile = (target.files as FileList)[0];
        const reader = new FileReader();
        reader.onload = () => {
            const content = reader.result as string;
            try {
                const obj = JSON.parse(content);
                this.validateDictionary(obj.title, obj.description, obj.words);
                this.newWords = obj.words;
                this.dictionaryForm.value.title = obj.title;
                this.dictionaryForm.value.description = obj.description;
                this.createNewDbDictionary();
            } catch (e) {
                const error = e as Error;
                if (error.message.includes('token')) this.error = 'Dictionnaire non admissible: seul le format JSON est accepté. ';
                else this.error = error.message;
                this.dictionaryForm.controls.file.reset();
            }
        };
        reader.readAsText(newFile);
    }

    validateDictionary(title: string, description: string, words: string[]) {
        const validTitle = title !== '' && title !== undefined;
        const validDescription = description !== '' && description !== undefined;
        if (!validTitle && !validDescription)
            throw new Error('Dictionnaire non admissible: votre dictionnaire doit contenir un titre et une description.');
        this.validateDictionaryWords(words);
    }

    validateDictionaryWords(words: string[]) {
        for (const word of words) {
            if (word.includes(' ') || !word.match(/[A-zÀ-ù]/g))
                throw new Error('Dictionnaire non admissible: au moins un des mots contient des caractères non alphabétiques.');
            if (word.length > BOARD_SIZE) throw new Error('Dictionnaire non admissible: au moins un des mots contient plus de 15 lettres.');
        }
    }

    async addDictionary() {
        this.uploadStatus = '';
        this.uploadStatus = await this.httpClient
            .post(`${environment.serverUrl}/dictionaries`, this.newDictionnary, { responseType: 'text' })
            .toPromise();
        this.snackbar.open(this.uploadStatus, 'OK', { duration: 2000, panelClass: ['snackbar'] });
        this.updateList();
    }

    async deleteDictionary(id: string) {
        await this.httpClient.delete<DbDictionary>(`${environment.serverUrl}/dictionaries/${id}`).toPromise();
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
        await this.httpClient.get(`${environment.serverUrl}/dictionary-files/${id}`).toPromise();
    }

    findDoubles(nameToFind: string): boolean {
        if (this.oldTitle === nameToFind) return false;
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

    async deleteAll() {
        await this.httpClient.delete(`${environment.serverUrl}/dictionaries-reset`).toPromise();
        this.updateList();
    }

    async confirmReset() {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr?',
            text: 'Vous vous apprêtez à réinitialiser tous les dictionnaires.',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non',
            heightAuto: false,
        });

        if (!result.value) return;
        if (result.isConfirmed) {
            this.deleteAll();
        } else {
            Swal.close();
        }
    }
}
