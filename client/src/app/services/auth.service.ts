import { Injectable } from '@angular/core';
import { PlayerId } from '@app/classes/room';

const IDS_KEY = 'ids';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    static getAuth(): { id?: PlayerId } {
        const idsString = sessionStorage.getItem(IDS_KEY) || '';
        const ids = idsString.split(';').filter((s) => s.length > 0);
        const auth: { id?: PlayerId } = {};
        if (ids.length > 0) {
            auth.id = ids.pop();
            sessionStorage.setItem(IDS_KEY, ids.join(';'));
        }
        return auth;
    }

    static saveAuth(id: PlayerId) {
        const idsString = sessionStorage.getItem(IDS_KEY) || '';
        const ids = idsString.split(';').filter((s) => s.length > 0);
        const filteredIds = ids.filter((ident) => ident !== id);
        filteredIds.push(id);
        sessionStorage.setItem(IDS_KEY, filteredIds.join(';'));
    }
}
