import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication.service';

import SpyObj = jasmine.SpyObj;

const dialogMock = {
    open: () => {
        return;
    },
};

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let location: Location;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), HttpClientModule, AppRoutingModule, AppMaterialModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: Location, useValue: location },
                { provide: MatDialog, useValue: {} },
                { provide: MatDialog, useValue: dialogMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open dialog', () => {
        // to get private attribute
        // eslint-disable-next-line dot-notation
        const openDialogSpy = spyOn(component['matDialog'], 'open').and.callThrough();
        component.openPopUp();
        expect(openDialogSpy).toHaveBeenCalled();
    });
});
