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

    it('should add new dictionnary to the list', fakeAsync(() => {
        // to get the private attribute snackbar
        // eslint-disable-next-line dot-notation
        const spy = spyOn(component['snackbar'], 'open');

        const subscription = component.addDictionary([
            new Blob(['{ "title": "dict-2", "description": "test-2", "words": ["d", "e", "f"] }']),
        ] as unknown as FileList);

        from(subscription).subscribe(() => {
            expect(spy).toHaveBeenCalled();
        });

        const req = httpMock.match(`${environment.serverUrl}/dictionaries`);
        expect(req.length).toBe(2);
        expect(req[1].request.method).toBe('POST');
        req[1].flush('succès');
        req[0].flush({ title: 'dict-2', description: 'test-2', words: ['d', 'e', 'f'] });
        httpMock.verify();
    }));

    it('should delete dictionnary', fakeAsync(() => {
        const listBeforeDelete: Dictionnary[] = [
            { id: 0, title: 'dict-0', description: 'test-0' },
            { id: 1, title: 'dict-1', description: 'test-1' },
        ];
        const id = 1;
        const listAfterDelete: Dictionnary[] = [{ id: 0, title: 'dict-0', description: 'test-0' }];

        const subscription = component.deleteDictionary(1);

        from(subscription).subscribe(() => {
            expect(component.dictionaries).toEqual(listAfterDelete);
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
            expect(component.dictionaries.length).toEqual(1);
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

    it('should update dictionary', async () => {
        component.dictionaries = [
            { id: 0, title: 'dict-0', description: 'test-0' },
            { id: 1, title: 'dict-1', description: 'test-1' },
        ];

        component.startEdit(1);
        // eslint-disable-next-line dot-notation
        const spy = spyOn(component['communicationService'], 'updateDictionaries').and.returnValue(Promise.resolve());
        const subscription = component.updateDictionary();

        const patchReq = httpMock.expectOne(`${environment.serverUrl}/dictionaries/1`);
        patchReq.flush(null);
        await subscription;

        expect(spy).toHaveBeenCalled();
        expect(patchReq.request.method).toBe('PATCH');
    });

    it('should find doubles', fakeAsync(() => {
        const list: Dictionnary[] = [{ id: 0, title: 'dict-0', description: 'test-0' }];
        component.dictionaries = list;
        const result = component.findDoubles('dict-0');

        expect(result).toEqual(true);

        const reqGet = httpMock.match(`${environment.serverUrl}/dictionaries`);
        expect(reqGet[0].request.method).toBe('GET');
        reqGet[0].flush(list);

        httpMock.verify();
    }));

    it('should empty form', fakeAsync(() => {
        const list: Dictionnary[] = [{ id: 0, title: 'dict-0', description: 'test-0' }];
        component.emptyForm();

        expect(component.dictionaryForm.value).toEqual({ title: null, description: null, file: null });

        const reqGet = httpMock.match(`${environment.serverUrl}/dictionaries`);
        expect(reqGet[0].request.method).toBe('GET');
        reqGet[0].flush(list);

        httpMock.verify();
    }));

    it('should call update list after delete all', fakeAsync(() => {
        // eslint-disable-next-line dot-notation
        const spy = spyOn(component['communicationService'], 'updateDictionaries').and.callThrough();
        const list: Dictionnary[] = [{ id: 0, title: 'dict-0', description: 'test-0' }];
        const subscription = component.deleteAll();

        from(subscription).subscribe(() => {
            expect(component.dictionaries).toEqual([]);
            expect(spy).toHaveBeenCalled();
        });

        component.deleteAll();

        const reqDeleteAll = httpMock.match(`${environment.serverUrl}/dictionaries/all`);
        const reqGet = httpMock.match(`${environment.serverUrl}/dictionaries`);
        expect(reqDeleteAll[0].request.method).toBe('DELETE');
        reqGet[0].flush(list);
        reqDeleteAll[0].flush([]);

        httpMock.verify();
    }));
});
