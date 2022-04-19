import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { HighScoresComponent, Score } from './high-scores.component';

const dialogMock = {
    close: () => {
        return;
    },
};

describe('HighScoresComponent', () => {
    let component: HighScoresComponent;
    let fixture: ComponentFixture<HighScoresComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [HighScoresComponent],
            providers: [{ provide: MatDialogRef, useValue: dialogMock }],
        }).compileComponents();
        httpMock = TestBed.inject(HttpTestingController);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HighScoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should return score', () => {
        const scores: Score[] = [{ score: 2, names: ['Dummy', 'Test'] }];
        const req = httpMock.match(`${environment.serverUrl}/high-scores`);

        expect(req[0].request.method).toBe('GET');
        req[0].flush(scores);
    });
});
