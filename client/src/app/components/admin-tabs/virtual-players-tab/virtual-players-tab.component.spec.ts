import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { VirtualPlayersTabComponent, VP } from './virtual-players-tab.component';

// class HttpClientMock {
//     list: VP[] = [
//         { default: true, beginner: true, name: 'Antoine' },
//         { default: false, beginner: true, name: 'Jean' },
//         { default: true, beginner: false, name: 'Simone' },
//         { default: false, beginner: false, name: 'Alexandra' },
//     ];

//     async get(url: string): Promise<VP[]> {
//         if (url) return this.list;
//         return [];
//     }
// }

fdescribe('VirtualPlayersTabComponent', () => {
    let component: VirtualPlayersTabComponent;
    let fixture: ComponentFixture<VirtualPlayersTabComponent>;
    let httpMock: HttpTestingController;
    // let httpClient: HttpClient;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [VirtualPlayersTabComponent],
            // providers: [{ provide: HttpClient, useValue: httpClient }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VirtualPlayersTabComponent);
        httpMock = TestBed.inject(HttpTestingController);
        // httpClient = TestBed.inject(HttpClient);
        component = fixture.componentInstance;
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

    it('should update list', async () => {
        const list: VP[] = [
            { default: true, beginner: true, name: 'Antoine' },
            { default: false, beginner: true, name: 'Jean' },
            { default: true, beginner: false, name: 'Simone' },
            { default: false, beginner: false, name: 'Alexandra' },
        ];

        component.updateList().then(() => expect(component.list).toEqual(list));

        const req = httpMock.match(`${environment.serverUrl}/vp-names`);
        expect(req[0].request.method).toBe('GET');
        req[0].flush(list);

        httpMock.verify();
    });

    it('should add player to list', async () => {
        const list: VP[] = [
            { default: true, beginner: true, name: 'Antoine' },
            { default: false, beginner: true, name: 'Jean' },
            { default: true, beginner: false, name: 'Simone' },
            { default: false, beginner: false, name: 'Alexandra' },
            { default: false, beginner: true, name: 'Benoit' },
        ];

        const beginnerList: VP[] = [
            { default: true, beginner: true, name: 'Antoine' },
            { default: false, beginner: true, name: 'Jean' },
            { default: false, beginner: true, name: 'Benoit' },
        ];

        const newVp: VP = { default: false, beginner: true, name: 'Benoit' };
        component.addPlayer(newVp.name, newVp.beginner).then(() => expect(component.beginnerList).toEqual(beginnerList));

        const req = httpMock.match(`${environment.serverUrl}/vp-names`);
        expect(req[0].request.method).toBe('POST');
        req[0].flush(list);

        httpMock.verify();
    });
});
