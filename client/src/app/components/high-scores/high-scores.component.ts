import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

type Score = { score: number; names: string[] };

@Component({
    selector: 'app-high-scores',
    templateUrl: './high-scores.component.html',
    styleUrls: ['./high-scores.component.scss'],
})
export class HighScoresComponent implements OnInit {
    log2990: boolean = false;
    scores: Score[] = [];

    constructor(private readonly httpClient: HttpClient) {}

    ngOnInit(): void {
        this.updateView();
    }

    async updateView() {
        this.scores = await this.httpClient.get<Score[]>(`${environment.serverUrl}/high-scores${this.log2990 ? '/log2990' : ''}`).toPromise();
    }
}
