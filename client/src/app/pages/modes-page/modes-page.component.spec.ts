import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationServiceMock } from '@app/constants';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommunicationService } from '@app/services/communication.service';
import { ModesPageComponent } from './modes-page.component';

export class ActivatedRouteMock {
    snapshot = { url: ['classic'] };
}

const dialogMock = {
    open: () => {
        return;
    },

    close: () => {
        return;
    },
};

describe('ModesPageComponent', () => {
    let component: ModesPageComponent;
    let fixture: ComponentFixture<ModesPageComponent>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        router = jasmine.createSpyObj(Router, ['createUrlTree', 'navigateByUrl']);
        await TestBed.configureTestingModule({
            declarations: [ModesPageComponent],
            imports: [AppMaterialModule, RouterTestingModule.withRoutes(routes), AppRoutingModule, HttpClientModule],
            providers: [
                { provide: MatDialog, useValue: dialogMock },
                { provide: ActivatedRoute, useValue: new ActivatedRouteMock() },
                { provide: Router, useValue: router },
                { provide: CommunicationService, useClass: CommunicationServiceMock },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(ModesPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('click on multiplayer mode should open dialog', fakeAsync(() => {
        const openDialogSpy = spyOn(component, 'openDialog').and.callThrough();
        fixture.debugElement.query(By.css('.Multijoueur')).nativeElement.click();
        tick();
        expect(openDialogSpy).toHaveBeenCalled();
    }));

    it('click on solo mode should open solo dialog', fakeAsync(() => {
        const openDialogSpy = spyOn(component, 'openSoloDialog').and.callThrough();
        fixture.debugElement.query(By.css('.Solo')).nativeElement.click();
        tick();
        expect(openDialogSpy).toHaveBeenCalled();
    }));
});
