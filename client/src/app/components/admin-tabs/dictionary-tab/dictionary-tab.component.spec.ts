import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DbDictionary } from '@app/classes/dictionnary';
import { from } from 'rxjs';
import { environment } from 'src/environments/environment';
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

fdescribe('DictionaryTabComponent', () => {
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

    it('should update list ont init', () => {
        const updateListSpy = spyOn(component, 'updateList').and.callThrough();
        component.ngOnInit();
        expect(updateListSpy).toHaveBeenCalled();
    });

    it('should update list', fakeAsync(() => {
        const list: DbDictionary[] = [
            { id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] },
            { id: 1, title: 'dict-1', description: 'test-1', words: ['d', 'e', 'f'] },
        ];

        const subscription = component.updateList();

        from(subscription).subscribe(() => {
            expect(component.list).toEqual(list);
        });

        const req = httpMock.match(`${environment.serverUrl}/dictionaries`);

        expect(req[1].request.method).toBe('GET');
        req[1].flush(list);

        httpMock.verify();
    }));

    it('should create new dictionary', () => {
        component.dictionaryForm.value.id = 1;
        component.dictionaryForm.value.title = 'dict-1';
        component.dictionaryForm.value.description = 'test-1';
        component.dictionaryForm.value.words = ['a', 'b', 'c'];
        component.newWords = ['a', 'b', 'c'];
        component.list = [{ id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] }];

        const newDictionary: DbDictionary = { id: 1, title: 'dict-1', description: 'test-1', words: ['a', 'b', 'c'] };
        const result: DbDictionary = component.createNewDbDictionary();
        expect(result).toEqual(newDictionary);
    });

    it('should get file infos ', async () => {
        setHTML();
        component.list = [{ id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] }];
        component.uploading = true;
        const dataTransfer = new DataTransfer();
        const expected: DbDictionary = { id: 1, title: 'dict-1', description: 'test-1', words: ['a', 'b', 'c'] };
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

    it('should update list when add a dictionary', fakeAsync(() => {
        component.list = [{ id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] }];
        component.dictionaryForm.value.id = 1;
        component.dictionaryForm.value.title = 'dict-1';
        component.dictionaryForm.value.description = 'test-1';
        component.newWords = ['a', 'b', 'c'];

        const updateSpy = spyOn(component, 'updateList');
        component.createNewDbDictionary();

        expect(component.newDictionnary).toEqual({ id: 1, title: 'dict-1', description: 'test-1', words: ['a', 'b', 'c'] });
        component.addDictionary();
        tick();
        const req = httpMock.match(`${environment.serverUrl}/dictionaries`);

        expect(req[2].request.method).toBe('POST');

        httpMock.verify();

        expect(updateSpy).toHaveBeenCalled();
    }));
});
