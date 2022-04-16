import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

type Score = { score: number; names: string[] };
type Page = { scores: Score[]; name: string };

@Component({
    selector: 'app-high-scores',
    templateUrl: './high-scores.component.html',
    styleUrls: ['./high-scores.component.scss'],
})
export class HighScoresComponent implements OnInit {
    pages: Page[] = [];

    constructor(private readonly httpClient: HttpClient, public dialogRef: MatDialogRef<HighScoresComponent>) {}

    async ngOnInit(): Promise<void> {
        const normal = await this.httpClient.get<Score[]>(`${environment.serverUrl}/high-scores`).toPromise();
        const log2990 = await this.httpClient.get<Score[]>(`${environment.serverUrl}/high-scores/log2990`).toPromise();
        this.pages = [
            { scores: normal, name: 'Mode Classique' },
            { scores: log2990, name: 'Mode LOG2990' },
        ];
    }
}
