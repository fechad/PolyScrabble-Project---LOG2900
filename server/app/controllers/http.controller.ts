import { Player, Room, State } from '@app/classes/room';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { HighScoresService } from '@app/services/high-scores.service';
import { LoginsService } from '@app/services/logins.service';
import { RoomsService } from '@app/services/rooms.service';
import { Request, Response, Router } from 'express';
import { ValidateFunction, Validator } from 'express-json-validator-middleware';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

const NEW_SCORE_SCHEMA: ValidateFunction = {
    type: 'object',
    required: ['id', 'token'],
    properties: {
        id: {
            type: 'string',
            minLength: 1,
        },
        token: {
            type: 'number',
        },
    },
};

@Service()
export class HttpController {
    router: Router;

    constructor(
        private readonly dictionnaryService: DictionnaryService,
        private readonly highScoreService: HighScoresService,
        private readonly logins: LoginsService,
        private readonly roomsService: RoomsService,
    ) {
        this.configureRouter();
        this.dictionnaryService.init();
        this.highScoreService.connect();
    }

    private configureRouter(): void {
        const { validate } = new Validator({});
        this.router = Router();
        this.router.get('/dictionnaries', (req: Request, res: Response) => {
            const dictionnaries = this.dictionnaryService.getDictionnaries();
            res.json(dictionnaries);
        });
        this.router.get('/high-scores', async (req: Request, res: Response) => {
            const scores = await this.highScoreService.getScores(false);
            res.json(scores);
        });
        this.router.get('/high-scores/log2990', async (req: Request, res: Response) => {
            const scores = await this.highScoreService.getScores(true);
            res.json(scores);
        });
        this.router.post('/high-scores', validate({ body: NEW_SCORE_SCHEMA }), async (req: Request, res: Response) => {
            if (!this.logins.verify(req.body.id, req.body.token)) return res.sendStatus(StatusCodes.UNAUTHORIZED);

            const result = this.roomsService.rooms
                .flatMap((r): [Room, Player | undefined][] => [
                    [r, r.mainPlayer],
                    [r, r.getOtherPlayer()],
                ])
                .find(([_, p]) => p?.id === req.body.id);
            if (!result || !result[1]) return res.sendStatus(StatusCodes.NOT_FOUND);
            const [room, player] = result;
            const game = this.roomsService.games.find((g) => g.id === room.id);
            if (game === undefined) return res.sendStatus(StatusCodes.NOT_FOUND);
            const info = game.getPlayerInfo(player.id);
            if (info === undefined) {
                // Impossible during execution, since the game players are the same as the rooms's one
                console.error('Different players in game and in room??');
                return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            }
            if (info.info.virtual) return res.sendStatus(StatusCodes.FORBIDDEN);
            if (room.getState() === State.Aborted) return res.sendStatus(StatusCodes.UNPROCESSABLE_ENTITY);
            await this.highScoreService.addScore({ name: info.info.name, score: info.score, log2990: room.parameters.log2990 });
            return res.sendStatus(StatusCodes.ACCEPTED);
        });
    }
}
