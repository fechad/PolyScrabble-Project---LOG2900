import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { CountdownComponent, CountdownTimer } from 'ngx-countdown';
import { InfosBoxComponent } from './infos-box.component';

describe('InfosBoxComponent', () => {
    let component: InfosBoxComponent;
    let fixture: ComponentFixture<InfosBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfosBoxComponent, CountdownComponent],
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes(routes), HttpClientModule, AppRoutingModule],
            providers: [CountdownTimer],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfosBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
