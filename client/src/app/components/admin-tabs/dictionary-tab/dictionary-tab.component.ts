import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Dictionnary } from '@app/classes/dictionnary';
import { CommunicationService } from '@app/services/communication.service';
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
    uploading: boolean = false;
    error: string = '';
    dictionaryForm: FormGroup;
    fileDownloaded: string;
    environment = environment;
    dictionaries: Dictionnary[] = [];
    editedDictionary: number | undefined;

    constructor(readonly httpClient: HttpClient, private formBuilder: FormBuilder, private snackbar: MatSnackBar, private communicationService: CommunicationService) {
        communicationService.dictionnaries.subscribe(dictionaries => {
            this.dictionaries = dictionaries;
        })
    }

    async ngOnInit(): Promise<void> {
        this.dictionaryForm = this.formBuilder.group({
            title: new FormControl('', [Validators.pattern('^[A-zÀ-ù]*$')]),
            description: new FormControl(''),
            file: new FormControl('', [Validators.required]),
        });
    }

    async addDictionary(files: FileList) {
        try {
            await this.httpClient.post<string>(`${environment.serverUrl}/dictionaries`, files[0]).toPromise();
            this.communicationService.updateDictionaries();
            this.snackbar.open('Le dictionnaire a bien été ajouté', 'OK', { duration: 2000, panelClass: ['snackbar'] });
        } catch (e) {
            console.error(e);
            this.snackbar.open("Le dictionnaire n'a pas pu être ajouté. Est-il dans le bon format?", 'OK', { duration: 2000, panelClass: ['snackbar'] });
        }
    }

    async deleteDictionary(id: number) {
        await this.httpClient.delete<void>(`${environment.serverUrl}/dictionaries/${id}`).toPromise();
        this.communicationService.updateDictionaries();
    }

    startEdit(id: number) {
        this.editedDictionary = id;
        const dictionary = this.dictionaries.find(dict => dict.id === id);
        if (!dictionary) return;
        this.dictionaryForm.get('title')?.setValue(dictionary.title)
        this.dictionaryForm.get('description')?.setValue(dictionary.description)
    }

    async updateDictionary() {
        const newTitle = this.dictionaryForm.value.title;
        if (this.findDoubles(newTitle)) {
            this.error = 'Un des dictionnaires détient déjà ce nom, veuillez en choisir un autre.';
            return;
        }
        if (newTitle.trim() === '') {
            this.error = 'Le titre ne peut pas être vide';
            return;
        }
        await this.httpClient.patch<void>(`${environment.serverUrl}/dictionaries/${this.editedDictionary}`, { title: newTitle, description: this.dictionaryForm.value.description }).toPromise();
        this.communicationService.updateDictionaries();
        this.editedDictionary = undefined;
    }

    async downloadDictionary(id: number) {
        await this.httpClient.get(`${environment.serverUrl}/dictionary/${id}`).toPromise();
    }

    findDoubles(titleToFind: string): boolean {
        return this.dictionaries.some((dictionary) => dictionary.title.toLowerCase() === titleToFind.toLowerCase());
    }

    emptyForm() {
        this.uploading = false;
        this.error = '';
        for (const key of Object.keys(this.dictionaryForm.controls)) {
            this.dictionaryForm.controls[key].reset();
        }
    }

    async deleteAll() {
        await this.httpClient.delete(`${environment.serverUrl}/dictionaries/all`).toPromise();
        this.communicationService.updateDictionaries();
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
        }
    }
}
