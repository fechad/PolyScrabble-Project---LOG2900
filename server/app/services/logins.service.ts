import { PlayerId } from '@app/classes/room';
import { randomInt } from 'crypto';
import { Service } from 'typedi';

type Token = number;

const TIMEOUT_DELETION = 5000; // ms
const MAX_TOKEN_VALUE = 10000000; // 1 μs per request

@Service()
export class LoginsService {
    private users: { [id: string]: { token: Token; loggedIn: boolean; cancelDeletion?: NodeJS.Timer } } = {};

    login(id: PlayerId | undefined, socketId: PlayerId): [PlayerId, Token] {
        if (!id || !this.users[id] || this.users[id].loggedIn) {
            id = socketId;
        }
        console.log(`Connexion par l'utilisateur avec id : ${id}`);

        const token = randomInt(MAX_TOKEN_VALUE);

        const prevDeletionTimeout = this.users[id]?.cancelDeletion;
        if (prevDeletionTimeout) clearTimeout(prevDeletionTimeout);

        this.users[id] = { token, loggedIn: true };
        return [id, token];
    }

    verify(id: PlayerId, token: Token): boolean {
        return this.users[id].token === token && this.users[id].loggedIn;
    }

    logout(id: PlayerId) {
        console.log(`Deconnexion par l'utilisateur avec id : ${id}`);
        this.users[id].loggedIn = false;
        this.users[id].cancelDeletion = setTimeout(() => {
            delete this.users[id];
        }, TIMEOUT_DELETION);
    }
}
