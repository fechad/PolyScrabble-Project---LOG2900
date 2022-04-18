import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VP } from '@app/classes/virtual-player';
import { from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VirtualPlayersTabComponent } from './virtual-players-tab.component';

class MatSnackBarMock {
    open() {
        return true;
    }
}

describe('VirtualPlayersTabComponent', () => {
    let component: VirtualPlayersTabComponent;
    let fixture: ComponentFixture<VirtualPlayersTabComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [VirtualPlayersTabComponent],
            providers: [{ provide: MatSnackBar, useClass: MatSnackBarMock }, Overlay],
        }).compileComponents();
        httpMock = TestBed.inject(HttpTestingController);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VirtualPlayersTabComponent);
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

    it('should update list', fakeAsync(() => {
        const list: VP[] = [
            { default: true, beginner: true, name: 'Antoine' },
            { default: false, beginner: true, name: 'Jean' },
            { default: true, beginner: false, name: 'Simone' },
            { default: false, beginner: false, name: 'Alexandra' },
        ];

        const subscription = component.updateList();

        from(subscription).subscribe(() => {
            expect(component.list).toEqual(list);
        });

        const req = httpMock.match(`${environment.serverUrl}/vp-names`);

        expect(req[1].request.method).toBe('GET');
        req[1].flush(list);

        httpMock.verify();
    }));

    it('should add player to list', fakeAsync(() => {
        const list: VP[] = [
            { default: true, beginner: true, name: 'Antoine' },
            { default: false, beginner: true, name: 'Jean' },
            { default: true, beginner: false, name: 'Simone' },
            { default: false, beginner: false, name: 'Alexandra' },
            { default: false, beginner: true, name: 'Anna' },
        ];

        const beginnerList: VP[] = [
            { default: true, beginner: true, name: 'Antoine' },
            { default: false, beginner: true, name: 'Jean' },
            { default: false, beginner: true, name: 'Anna' },
        ];

        const newVp: VP = { default: false, beginner: true, name: 'Anna' };

        const subscription = component.addPlayer(newVp.name, newVp.beginner);
        tick();
        from(subscription).subscribe(() => {
            expect(component.beginnerList).toEqual(beginnerList);
        });
        const req = httpMock.match(`${environment.serverUrl}/vp-names`);
        expect(req[1].request.method).toBe('POST');
        req[1].flush(list);
        req[0].flush(list);
        httpMock.verify();
    }));
    it('should update player in list', fakeAsync(() => {
        const list: VP[] = [
            { default: true, beginner: true, name: 'Anna' },
            { default: false, beginner: true, name: 'Jean' },
            { default: true, beginner: false, name: 'Simone' },
            { default: false, beginner: false, name: 'Alexandra' },
        ];

        const newVp: VP = { default: true, beginner: true, name: 'Anna' };

        const subscription = component.updatePlayer('Antoine', newVp.name, newVp.beginner);

        from(subscription).subscribe(() => {
            expect(component.list[0]).toEqual(newVp);
        });

        const req = httpMock.match(`${environment.serverUrl}/vp-names`);
        expect(req[1].request.method).toBe('PATCH');
        req[1].flush(list);
        req[0].flush(list);

        httpMock.verify();
    }));

    it('should delete player from list', fakeAsync(() => {
        const result: VP[] = [
            { default: false, beginner: true, name: 'Jean' },
            { default: true, beginner: false, name: 'Simone' },
            { default: false, beginner: false, name: 'Alexandra' },
        ];

        const subscription = component.deletePlayer('Anna');

        from(subscription).subscribe(() => {
            expect(component.list).toEqual(result);
        });

        const reqDelete = httpMock.match(`${environment.serverUrl}/vp-names/Anna`);
        const reqGet = httpMock.match(`${environment.serverUrl}/vp-names`);

        expect(reqDelete[0].request.method).toBe('DELETE');
        expect(reqGet[0].request.method).toBe('GET');
        reqDelete[0].flush(result);
        reqGet[0].flush(result);

        httpMock.verify();
    }));

    it('should validate good name', () => {
        const validName: string[] = ['ama', 'anana', 'Anno'];
        const result1 = component.invalidName(validName[0], true);
        const result2 = component.invalidName(validName[1], true);
        const result3 = component.invalidName(validName[2], true);
        expect(result1).toBe(false);
        expect(result2).toBe(false);
        expect(result3).toBe(false);
    });

    it('should invalidate bad names', () => {
        const invalidName: string[] = ['123', 'V-/', '*+'];
        const result1 = component.invalidName(invalidName[0], true);
        const result2 = component.invalidName(invalidName[1], true);
        const result3 = component.invalidName(invalidName[2], true);
        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(result3).toBe(true);
    });

    it('should tell if name already in list', () => {
        const list: VP[] = [
            { default: false, beginner: true, name: 'Jean' },
            { default: true, beginner: false, name: 'Simone' },
            { default: false, beginner: false, name: 'Alexandra' },
        ];

        component.list = list;
        const result: boolean = component.findDoubles('Simone', false);
        expect(result).toBe(true);
    });

    it('should hideInput', () => {
        component.nameInput = 'test1';
        component.nameInputExpert = 'test2';
        component.hideInput(true);
        component.hideInput(false);
        expect(component.nameInput).toBe('');
        expect(component.nameInputExpert).toBe('');
        expect(component.clicked).toEqual([false, false]);
    });
});
