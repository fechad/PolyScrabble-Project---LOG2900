import { State } from '@app/classes/room';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { GameHistoryService } from '@app/services/game-history-service';
import { HighScoresService } from '@app/services/high-scores.service';
import { LoginsService } from '@app/services/logins.service';
import { RoomsService } from '@app/services/rooms.service';
import { VpNamesService } from '@app/services/vp-names.service';
import { Request, Response, Router } from 'express';
import { ValidateFunction, Validator } from 'express-json-validator-middleware';
import { StatusCodes } from 'http-status-codes';
import { Container, Service } from 'typedi';
import { DataBaseController } from './db.controller';

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

const NEW_DICT_SCHEMA: ValidateFunction = {
    type: 'object',
    required: ['name', 'description', 'words'],
    properties: {
        name: {
            type: 'string',
            minLength: 1,
        },
        description: {
            type: 'string',
        },
        words: {
            type: 'array',
            items: {
                type: 'string',
                minLength: 2,
            },
        },
    },
};

const PATCH_DICT_SCHEMA: ValidateFunction = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 1,
        },
        description: {
            type: 'string',
        },
    },
};

@Service()
export class HttpController {
    router: Router;
    private vpNamesService: VpNamesService;

    constructor(
        private readonly dictionnaryService: DictionnaryService,
        private readonly logins: LoginsService,
        private readonly roomsService: RoomsService,
        private readonly dataBase: DataBaseController,
        private readonly highScoreService: HighScoresService,
        private readonly gameHistoryService: GameHistoryService,
    ) {
        this.init();
        this.configureRouter();
    }

    private async init() {
        await this.dataBase.connect();
        this.vpNamesService = Container.get(VpNamesService);
        await this.highScoreService.connect();
        await this.gameHistoryService.connect();
    }

    private configureRouter() {
        const { validate } = new Validator({});
        this.router = Router();
        this.router.delete('/high-scores', async (req: Request, res: Response) => {
            await this.highScoreService.resetScores(res);
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

            const room = this.roomsService.rooms.find((r) => r.id === req.body.room);
            if (!room) return res.sendStatus(StatusCodes.NOT_FOUND);
            const player =
                room.mainPlayer.id === req.body.id ? room.mainPlayer : room.getOtherPlayer()?.id === req.body.id ? room.getOtherPlayer() : undefined;
            if (!player) return res.sendStatus(StatusCodes.FORBIDDEN);
            const game = this.roomsService.games.find((g) => g.id === room.id);
            if (!game) return res.sendStatus(StatusCodes.NOT_FOUND);
            const info = game.getPlayerInfo(player.id);
            if (info.info.virtual) return res.sendStatus(StatusCodes.FORBIDDEN);
            if (room.getState() === State.Aborted && game.getWinner() !== player.id) return res.sendStatus(StatusCodes.FORBIDDEN);
            await this.highScoreService.addScore({ name: info.info.name, score: info.score, log2990: room.parameters.log2990 });
            return res.sendStatus(StatusCodes.ACCEPTED);
        });
        this.router.get('/game-history', async (req: Request, res: Response) => {
            const games = await this.gameHistoryService.getHistory();
            res.json(games);
        });

        this.router.delete('/game-history', async (req: Request, res: Response) => {
            const history = await this.gameHistoryService.clearHistory();
            res.json(history);
        });

        this.router.get('/vp-names', async (req: Request, res: Response) => {
            const names = await this.vpNamesService.getNames();
            res.json(names);
        });

        this.router.post('/vp-names', async (req: Request, res: Response) => {
            await this.vpNamesService.addVP(req.body, res);
        });
        this.router.patch('/vp-names', async (req: Request, res: Response) => {
            const names = await this.vpNamesService.updateVP(req.body);
            res.json(names);
        });
        this.router.delete('/vp-names/:name', async (req: Request, res: Response) => {
            const names = await this.vpNamesService.deleteVP(req.params.name);
            res.json(names);
        });

        this.router.get('/dictionaries/:id', async (req: Request, res: Response) => {
            const dictionary = this.dictionnaryService.get(Number.parseInt(req.params.id));
            if (!dictionary) res.sendStatus(StatusCodes.NOT_FOUND);
            else res.download(dictionary.filename);
        });
        this.router.patch('/dictionaries/:id', validate({ body: PATCH_DICT_SCHEMA }), async (req: Request, res: Response) => {
            await this.dictionnaryService.update(Number.parseInt(req.params.id), req.body.name, req.body.description);
            res.sendStatus(StatusCodes.NO_CONTENT);
        });
        this.router.delete('/dictionaries/all', async (req: Request, res: Response) => {
            await this.dictionnaryService.deleteAll();
            res.sendStatus(StatusCodes.NO_CONTENT);
        });
        this.router.delete('/dictionaries/:id', async (req: Request, res: Response) => {
            await this.dictionnaryService.delete(Number.parseInt(req.params.id));
            res.sendStatus(StatusCodes.NO_CONTENT);
        });
        this.router.get('/dictionaries', async (req: Request, res: Response) => {
            const dictionnaries = this.dictionnaryService.getDictionnaries();
            res.json(dictionnaries);
        });
        this.router.post('/dictionaries', validate({ body: NEW_DICT_SCHEMA }), async (req: Request, res: Response) => {
            const response = await this.dictionnaryService.add(req.body.name, req.body.description, req.body.words);
            res.status(StatusCodes.OK).json(response);
        });

        this.router.delete('/vp-names-reset', async (req: Request, res: Response) => {
            const names = await this.vpNamesService.deleteAll();
            res.json(names);
        });
    }
}
