import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { faHome, faSync } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    @ViewChild('tabs') tabsRef: ElementRef;
    faHome = faHome;
    faRefresh = faSync;
    tabSelection: string = 'history';
    constructor(readonly httpClient: HttpClient) {}

    changeSelection(e: MouseEvent) {
        const selection = e.target as HTMLElement;
        const id = selection.id;
        Array.from(this.tabsRef.nativeElement.children).forEach((element) => {
            const elem = element as HTMLElement;
            if (elem.id === id) {
                elem.classList.add('selected');
                this.tabSelection = id;
            } else elem.classList.remove('selected');
        });
    }

    async resetAll() {
        await this.httpClient.delete(`${environment.serverUrl}/reset`).toPromise();
        window.location.reload();
    }
}
