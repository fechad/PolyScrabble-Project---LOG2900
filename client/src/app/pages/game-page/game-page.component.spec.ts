import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { GridService } from '@app/services/grid.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';

// import SpyObj = jasmine.SpyObj;
export class MatDialogMock {
    open() {
        return { afterClosed: () => of({}) };
    }
}

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, SidebarComponent, PlayAreaComponent],
            imports: [RouterTestingModule.withRoutes(routes), HttpClientTestingModule, FontAwesomeModule],
            providers: [{ provide: CommunicationService }, { provide: MatDialog, useClass: MatDialogMock }, { provide: GridService, usevalue: {} }],
        }).compileComponents();
        fixture = TestBed.createComponent(GamePageComponent);
        const router = TestBed.inject(Router);
        router.initialNavigation();
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call openConfirmation() when quit-game button clicked ', fakeAsync(() => {
        const quitGameSpy = spyOn(component, 'openConfirmation').and.callThrough();
        const button = fixture.debugElement.query(By.css('#quit-game'));
        button.nativeElement.click();
        tick();
        expect(quitGameSpy).toHaveBeenCalled();
    }));

    it('click on reducing font size of board should call reduceFont()', fakeAsync(() => {
        const reduceFontSpy = spyOn(component, 'reduceFont').and.callThrough();
        const button = fixture.debugElement.query(By.css('#reduce'));
        button.nativeElement.click();
        tick();
        expect(reduceFontSpy).toHaveBeenCalled();
    }));

    it('click on reset font size of board should call resetFont()', fakeAsync(() => {
        const resetFontSpy = spyOn(component, 'resetFont').and.callThrough();
        const button = fixture.debugElement.query(By.css('#reset'));
        button.nativeElement.click();
        tick();
        expect(resetFontSpy).toHaveBeenCalled();
    }));

    it('click on increasing font size of board should call increaseFont()', fakeAsync(() => {
        const increaseFontSpy = spyOn(component, 'increaseFont').and.callThrough();
        const button = fixture.debugElement.query(By.css('#increase'));
        button.nativeElement.click();
        tick();
        expect(increaseFontSpy).toHaveBeenCalled();
    }));
});
