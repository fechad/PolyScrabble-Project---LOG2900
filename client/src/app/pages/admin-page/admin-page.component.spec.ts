import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationServiceMock } from '@app/constants';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { AdminPageComponent } from './admin-page.component';

const setHTML = () => {
    const page = document.createElement('div');
    const button1 = document.createElement('button');
    button1.id = 'history';
    const button2 = document.createElement('button');
    button2.id = 'dictionaries';
    const button3 = document.createElement('button');
    button3.id = 'vp';

    page.appendChild(button1);
    page.appendChild(button2);
    page.appendChild(button3);
    document.body.appendChild(page);
};

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), HttpClientModule, AppRoutingModule],
            declarations: [AdminPageComponent],
            providers: [{ provide: CommunicationService, useClass: CommunicationServiceMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change tabs when click on a specific button element', () => {
        setHTML();
        const event = new MouseEvent('click');
        const history = document.getElementById('history');
        history?.addEventListener('click', (e) => component.changeSelection(e));
        const dictionaries = document.getElementById('dictionaries');
        history?.dispatchEvent(event);

        expect(history?.classList.contains('selected')).toBeTruthy();
        expect(dictionaries?.classList.contains('selected')).toBeFalsy();
    });
});
