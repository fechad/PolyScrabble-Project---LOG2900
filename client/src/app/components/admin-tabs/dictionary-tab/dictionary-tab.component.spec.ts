import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Dictionnary } from '@app/classes/dictionnary';
import { from } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { DictionaryTabComponent } from './dictionary-tab.component';

const setHTML = () => {
    const div = document.createElement('div');
    div.classList.add('box');
    const input = document.createElement('input');
    input.id = 'upload';
    input.type = 'file';
    input.accept = '.json';
    input.classList.add('form-control');
    div.appendChild(input);
    document.body.appendChild(div);
};

const TIME_OUT = 100;

describe('DictionaryTabComponent', () => {
    let component: DictionaryTabComponent;
    let fixture: ComponentFixture<DictionaryTabComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, ReactiveFormsModule],
            declarations: [DictionaryTabComponent],
            providers: [FormBuilder, MatSnackBar, Overlay],
        }).compileComponents();
        httpMock = TestBed.inject(HttpTestingController);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DictionaryTabComponent);
        component = fixture.componentInstance;
        component.dictionaryForm = new FormGroup({
            id: new FormControl(0),
            title: new FormControl('', [Validators.pattern('^[A-zÀ-ù]*$')]),
            description: new FormControl(''),
            file: new FormControl('', [Validators.required]),
        });
        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get file infos ', async () => {
        setHTML();
        component.dictionaries = [{ id: 0, title: 'dict-0', description: 'test-0' }];
        component.uploading = true;
        const dataTransfer = new DataTransfer();
        const expected: Dictionnary[] = { id: 1, title: 'dict-1', description: 'test-1', words: ['a', 'b', 'c'] };
        const dictionaryFile = new File([JSON.stringify({ title: 'dict-1', description: 'test-1', words: ['a', 'b', 'c'] })], 'dict-1.json', {
            type: 'application/json',
        });
        dataTransfer.items.add(dictionaryFile);
        const inputCollection = document.getElementsByClassName('form-control');
        const input = inputCollection.item(0) as HTMLInputElement;
        input.files = dataTransfer.files;

        input.addEventListener('change', async (event: Event) => await component.getFileInfos(event));
        input.dispatchEvent(new InputEvent('change'));
        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), TIME_OUT);
        });

        expect(component.newDictionnary).toEqual(expected);
        fixture.detectChanges();
    });

    it('should return error message if wrong json format ', async () => {
        setHTML();
        component.list = [{ id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] }];
        component.uploading = true;
        const dataTransfer = new DataTransfer();
        const dictionaryFile = new File([JSON.stringify({ description: 'test-1', words: ['a', 'b', 'c'] })], 'dict-1.txt', {
            type: 'text/plain',
        });
        dataTransfer.items.add(dictionaryFile);
        const inputCollection = document.getElementsByClassName('form-control');
        const input = inputCollection.item(0) as HTMLInputElement;
        input.files = dataTransfer.files;

        input.addEventListener('change', async (event: Event) => await component.getFileInfos(event));
        input.dispatchEvent(new InputEvent('change'));
        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), TIME_OUT);
        });

        expect(component.error).not.toBeUndefined();
        fixture.detectChanges();
    });

    it('should add new dictionnary to the list', fakeAsync(() => {
        component.newDictionnary = { id: 2, title: 'dict-2', description: 'test-2', words: ['d', 'e', 'f'] };
        // to get the private attribute snackbar
        // eslint-disable-next-line dot-notation
        const spy = spyOn(component['snackbar'], 'open').and.callThrough();

        const subscription = component.addDictionary();

        from(subscription).subscribe(() => {
            expect(component.uploadStatus).toEqual('succès');
            expect(spy).toHaveBeenCalled();
        });

        const req = httpMock.match(`${environment.serverUrl}/dictionaries`);
        expect(req[2].request.method).toBe('POST');
        req[1].flush('succès');
        req[0].flush({ id: 2, title: 'dict-2', description: 'test-2', words: ['d', 'e', 'f'] });
        httpMock.verify();
    }));

    it('should delete dictionnary', fakeAsync(() => {
        const listBeforeDelete: DbDictionary[] = [
            { id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] },
            { id: 1, title: 'dict-1', description: 'test-1', words: ['d', 'e', 'f'] },
        ];
        const id = 1;
        const listAfterDelete: DbDictionary[] = [{ id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] }];

        const subscription = component.deleteDictionary('1');

        from(subscription).subscribe(() => {
            expect(component.list).toEqual(listAfterDelete);
        });

        const reqDelete = httpMock.match(`${environment.serverUrl}/dictionaries/${id}`);
        const reqGet = httpMock.match(`${environment.serverUrl}/dictionaries`);

        expect(reqDelete[0].request.method).toBe('DELETE');
        expect(reqGet[0].request.method).toBe('GET');
        reqDelete[0].flush(listBeforeDelete);
        reqGet[0].flush(listAfterDelete);

        httpMock.verify();
    }));

    it('should delete all dictionaries from list except default one', fakeAsync(() => {
        const subscription = component.deleteAll();

        from(subscription).subscribe(() => {
            expect(component.list.length).toEqual(1);
        });
    }));

    it('should delete all dictionaries from list except default one on confirmation', fakeAsync(() => {
        const spy = spyOn(component, 'deleteAll').and.callThrough();

        component.confirmReset();
        Swal.clickConfirm();
        tick();
        flush();
        expect(spy).toHaveBeenCalled();
    }));

    it('should update dictionnary', fakeAsync(() => {
        const listBeforeUpdate: DbDictionary[] = [
            { id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] },
            { id: 1, title: 'dict-1', description: 'test-1', words: ['d', 'e', 'f'] },
        ];
        const listAfterUpdate: DbDictionary[] = [
            { id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] },
            { id: 1, title: 'dict-2', description: 'test-1', words: ['d', 'e', 'f'] },
        ];
        component.list = listBeforeUpdate;
        component.dictionaryForm.value.title = 'dict-2';
        component.oldTitle = 'dict-1';

        const spy = spyOn(component, 'updateList').and.callThrough();
        const subscription = component.updateDictionary();

        from(subscription).subscribe(() => {
            expect(spy).toHaveBeenCalled();
            expect(component.list).toEqual(listAfterUpdate);
        });

        const req = httpMock.match(`${environment.serverUrl}/dictionaries`);
        expect(req[2].request.method).toBe('PATCH');
        req[0].flush(listBeforeUpdate);
        req[1].flush(listAfterUpdate);

        httpMock.verify();
    }));

    it('should download dictionnary function', fakeAsync(() => {
        component.downloadDictionary('1');
        const req = httpMock.match(`${environment.serverUrl}/dictionary-files/1`);
        const reqGet = httpMock.match(`${environment.serverUrl}/dictionaries`);
        expect(req[0].request.method).toBe('GET');
        req[0].flush('/dict-1.json');
        reqGet[0].flush('');

        httpMock.verify();
    }));

    it('should find doubles', fakeAsync(() => {
        const list: DbDictionary[] = [{ id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] }];
        component.list = list;
        const result = component.findDoubles('dict-0');

        expect(result).toEqual(true);

        const reqGet = httpMock.match(`${environment.serverUrl}/dictionaries`);
        expect(reqGet[0].request.method).toBe('GET');
        reqGet[0].flush(list);

        httpMock.verify();
    }));

    it('should empty form', fakeAsync(() => {
        const list: DbDictionary[] = [{ id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] }];
        component.emptyForm();

        expect(component.dictionaryForm.value).toEqual({ id: null, title: null, description: null, file: null });

        const reqGet = httpMock.match(`${environment.serverUrl}/dictionaries`);
        expect(reqGet[0].request.method).toBe('GET');
        reqGet[0].flush(list);

        httpMock.verify();
    }));

    it('should not add dictionary if form is not filed out', fakeAsync(() => {
        const spy = spyOn(component, 'addDictionary').and.callThrough();
        const list: DbDictionary[] = [{ id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] }];
        component.onSubmit();

        expect(spy).not.toHaveBeenCalled();

        const reqGet = httpMock.match(`${environment.serverUrl}/dictionaries`);
        expect(reqGet[0].request.method).toBe('GET');
        reqGet[0].flush(list);

        httpMock.verify();
    }));

    it('should call update list after delete all', fakeAsync(() => {
        const spy = spyOn(component, 'updateList').and.callThrough();
        const list: DbDictionary[] = [{ id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] }];
        const subscription = component.deleteAll();

        from(subscription).subscribe(() => {
            expect(component.list).toEqual([]);
            expect(spy).toHaveBeenCalled();
        });

        component.onSubmit();

        const reqDeleteAll = httpMock.match(`${environment.serverUrl}/dictionaries-reset`);
        const reqGet = httpMock.match(`${environment.serverUrl}/dictionaries`);
        expect(reqDeleteAll[0].request.method).toBe('DELETE');
        reqGet[0].flush(list);
        reqDeleteAll[0].flush([]);

        httpMock.verify();
    }));
});
