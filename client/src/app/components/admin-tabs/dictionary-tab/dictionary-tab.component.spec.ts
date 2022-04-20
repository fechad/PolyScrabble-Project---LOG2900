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

        const req = httpMock.expectOne(`${environment.serverUrl}/dictionaries`);
        expect(req.request.method).toBe('POST');
        req.flush('succès');
        httpMock.verify();
    }));

    it('should delete dictionnary', async () => {
        const id = 1;

        const promise = component.deleteDictionary(1);

        const reqDelete = httpMock.expectOne(`${environment.serverUrl}/dictionaries/${id}`);

        expect(reqDelete.request.method).toBe('DELETE');
        reqDelete.flush('');

        await promise;

        httpMock.verify();
    });

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
        const subscription = component.updateDictionary();

        const patchReq = httpMock.expectOne(`${environment.serverUrl}/dictionaries/1`);
        patchReq.flush(null);
        await subscription;

        expect(patchReq.request.method).toBe('PATCH');
    });

    it('should find doubles', fakeAsync(() => {
        const list: Dictionnary[] = [{ id: 0, title: 'dict-0', description: 'test-0' }];
        component.dictionaries = list;
        const result = component.findDoubles('dict-0');

        expect(result).toEqual(true);

        httpMock.verify();
    }));

    it('should empty form', fakeAsync(() => {
        component.emptyForm();

        expect(component.dictionaryForm.value).toEqual({ title: null, description: null, file: null });

        httpMock.verify();
    }));

    it('should call update list after delete all', fakeAsync(() => {
        // eslint-disable-next-line dot-notation
        const subscription = component.deleteAll();

        from(subscription).subscribe(() => {
            expect(component.dictionaries).toEqual([]);
        });

        component.deleteAll();

        const reqDeleteAll = httpMock.match(`${environment.serverUrl}/dictionaries/all`);
        expect(reqDeleteAll[0].request.method).toBe('DELETE');
        reqDeleteAll[0].flush([]);

        httpMock.verify();
    }));
});
