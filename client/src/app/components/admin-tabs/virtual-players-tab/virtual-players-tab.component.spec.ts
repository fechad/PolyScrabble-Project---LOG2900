import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { from } from 'rxjs';
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
        httpMock = TestBed.inject(HttpTestingController);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VirtualPlayersTabComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // it('should create', () => {
    //     expect(component).toBeTruthy();
    // });

    // it('should update list ont init', () => {
    //     const updateListSpy = spyOn(component, 'updateList').and.callThrough();
    //     component.ngOnInit();
    //     expect(updateListSpy).toHaveBeenCalled();
    // });

    // it('should update list', fakeAsync(() => {
    //     const list: VP[] = [
    //         { default: true, beginner: true, name: 'Antoine' },
    //         { default: false, beginner: true, name: 'Jean' },
    //         { default: true, beginner: false, name: 'Simone' },
    //         { default: false, beginner: false, name: 'Alexandra' },
    //     ];

    //     const subscription = component.updateList();

    //     from(subscription).subscribe(() => {
    //         expect(component.list).toEqual(list);
    //         console.log('component list', component.list);
    //     });

    //     const req = httpMock.match(`${environment.serverUrl}/vp-names`);

    //     expect(req[1].request.method).toBe('GET');
    //     req[1].flush(list);

    //     httpMock.verify();
    // }));

    // it('should add player to list', fakeAsync(() => {
    //     const list: VP[] = [
    //         { default: true, beginner: true, name: 'Antoine' },
    //         { default: false, beginner: true, name: 'Jean' },
    //         { default: true, beginner: false, name: 'Simone' },
    //         { default: false, beginner: false, name: 'Alexandra' },
    //         { default: false, beginner: true, name: 'Anna' },
    //     ];

    //     const beginnerList: VP[] = [
    //         { default: true, beginner: true, name: 'Antoine' },
    //         { default: false, beginner: true, name: 'Jean' },
    //         { default: false, beginner: true, name: 'Anna' },
    //     ];

    //     const newVp: VP = { default: false, beginner: true, name: 'Anna' };

    //     const subscription = component.addPlayer(newVp.name, newVp.beginner);

    //     from(subscription).subscribe(() => {
    //         expect(component.beginnerList).toEqual(beginnerList);
    //         console.log('beginner list', component.beginnerList);
    //     });

    //     const req = httpMock.match(`${environment.serverUrl}/vp-names`);
    //     expect(req[1].request.method).toBe('POST');
    //     req[1].flush(list);
    //     req[0].flush(list);

    //     httpMock.verify();
    // }));
    // it('should update player in list', fakeAsync(() => {
    //     const list: VP[] = [
    //         { default: true, beginner: true, name: 'Anna' },
    //         { default: false, beginner: true, name: 'Jean' },
    //         { default: true, beginner: false, name: 'Simone' },
    //         { default: false, beginner: false, name: 'Alexandra' },
    //     ];

    //     const newVp: VP = { default: true, beginner: true, name: 'Anna' };

    //     const subscription = component.updatePlayer('Antoine', newVp.name, newVp.beginner);

    //     from(subscription).subscribe(() => {
    //         expect(component.list[0]).toEqual(newVp);
    //         console.log('new VP', component.beginnerList[0]);
    //     });

    //     const req = httpMock.match(`${environment.serverUrl}/vp-names`);
    //     expect(req[1].request.method).toBe('PATCH');
    //     req[1].flush(list);
    //     req[0].flush(list);

    //     httpMock.verify();
    // }));

    it('should delete player from list', fakeAsync(() => {
        const result: VP[] = [
            { default: false, beginner: true, name: 'Jean' },
            { default: true, beginner: false, name: 'Simone' },
            { default: false, beginner: false, name: 'Alexandra' },
        ];

        const subscription = component.deletePlayer('Anna');

        from(subscription).subscribe(() => {
            expect(component.list).toEqual(result);
            console.log('new list', component.list);
        });

        const reqDelete = httpMock.match(`${environment.serverUrl}/vp-names/Anna`);
        const reqGet = httpMock.match(`${environment.serverUrl}/vp-names`);

        expect(reqDelete[0].request.method).toBe('DELETE');
        expect(reqGet[0].request.method).toBe('GET');
        reqDelete[0].flush(result);
        reqGet[0].flush(result);

        httpMock.verify();
    }));

    it('should update list ont init', () => {
        const updateListSpy = spyOn(component, 'updateList').and.callThrough();
        component.ngOnInit();
        expect(updateListSpy).toHaveBeenCalled();
    });
});
