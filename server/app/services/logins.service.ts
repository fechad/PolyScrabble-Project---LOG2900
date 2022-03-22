import { PlayerId } from '@app/classes/room';
import * as cst from '@app/constants';
import { randomInt } from 'crypto';
import { Service } from 'typedi';
type Token = number;

type Users = { [id: string]: { token: Token; loggedIn: boolean; cancelDeletion?: NodeJS.Timer } };
@Service()
export class LoginsService {
    private users: Users = {};

    login(id: PlayerId | undefined, socketId: PlayerId): [PlayerId, Token] {
        if (!id || !this.users[id] || this.users[id].loggedIn) {
            id = socketId;
        }
        console.log(`Connexion par l'utilisateur avec id : ${id}`);

        const token = randomInt(cst.MAX_TOKEN_VALUE);

        const prevDeletionTimeout = this.users[id]?.cancelDeletion;
        if (prevDeletionTimeout) clearTimeout(prevDeletionTimeout);

        this.users[id] = { token, loggedIn: true };
        return [id, token];
    }

    verify(id: PlayerId, token: Token): boolean {
        return this.users[id]?.token === token && this.users[id]?.loggedIn;
    }

    logout(id: PlayerId) {
        console.log(`Deconnexion par l'utilisateur avec id : ${id}`);
        this.users[id].loggedIn = false;
        this.users[id].cancelDeletion = setTimeout(() => {
            delete this.users[id];
        }, cst.TIMEOUT_DELETION);
    }
}
