import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DbDictionary, DictionaryTabComponent } from './dictionary-tab.component';

// const setHTML = () => {
//     const div = document.createElement('div');
//     div.classList.add('box');
//     const input = document.createElement('input');
//     input.id = 'upload';
//     input.type = 'file';
//     input.accept = '.json';
//     input.classList.add('form-control');
//     div.appendChild(input);
//     document.body.appendChild(div);
// };

// const TIME_OUT = 100;

describe('DictionaryTabComponent', () => {
    let component: DictionaryTabComponent;
    let fixture: ComponentFixture<DictionaryTabComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, ReactiveFormsModule],
            declarations: [DictionaryTabComponent],
            providers: [FormBuilder],
        }).compileComponents();
        httpMock = TestBed.inject(HttpTestingController);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DictionaryTabComponent);
        component = fixture.componentInstance;
        component.dictionaryForm = new FormGroup({
            id: new FormControl(''),
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
        component.list = [{ id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] }];
        const newDictionary: DbDictionary = { id: 1, title: 'dict-1', description: 'test-1', words: ['a', 'b', 'c'] };
        const result: DbDictionary = component.createNewDbDictionary('dict-1', 'test-1', ['a', 'b', 'c']);
        expect(result).toEqual(newDictionary);
    });

    // it('should get file infos ', async () => {
    //     setHTML();
    //     component.list = [{ id: 0, title: 'dict-0', description: 'test-0', words: ['a', 'b', 'c'] }];
    //     component.uploading = true;
    //     const dataTransfer = new DataTransfer();
    //     const expected: DbDictionary = { id: 1, title: 'dict-1', description: 'test-1', words: ['a', 'b', 'c'] };
    //     const dictionaryFile = new File([JSON.stringify({ title: 'dict-1', description: 'test-1', words: ['a', 'b', 'c'] })], 'dict-1.json', {
    //         type: 'application/json',
    //     });
    //     dataTransfer.items.add(dictionaryFile);
    //     const inputCollection = document.getElementsByClassName('form-control');
    //     const input = inputCollection.item(0) as HTMLInputElement;
    //     input.files = dataTransfer.files;

    //     input.addEventListener('change', async (event: Event) => await component.getFileInfos(event));
    //     input.dispatchEvent(new InputEvent('change'));
    //     await new Promise<void>((resolve) => {
    //         setTimeout(() => resolve(), TIME_OUT);
    //     });

    //     expect(component.newDictionnary).toEqual(expected);
    //     fixture.detectChanges();
    // });
});
