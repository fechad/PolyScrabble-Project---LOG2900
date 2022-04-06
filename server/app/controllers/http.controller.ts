import { State } from '@app/classes/room';
import { DbDictionariesService } from '@app/services/db-dictionaries.service';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { GameHistoryService } from '@app/services/game-history-service';
import { HighScoresService } from '@app/services/high-scores.service';
import { LoginsService } from '@app/services/logins.service';
import { RoomsService } from '@app/services/rooms.service';
import { VpNamesService } from '@app/services/vp-names.service';
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

    highScoreService: HighScoresService;
    gameHistoryService: GameHistoryService;
    private highScoreService: HighScoresService;
    private vpNamesService: VpNamesService;
    private dbDictionaryService: DbDictionariesService;

    constructor(
        private readonly dictionnaryService: DictionnaryService,
        private readonly logins: LoginsService,
        private readonly roomsService: RoomsService,
        private readonly gameHistoryService: GameHistoryService,
    ) {
        this.dictionnaryService.init();
        this.gameHistoryService.connect();
        this.highScoreService.connect();
        this.init();
        this.configureRouter();
    }

    private async init() {
        await this.dataBase.connect();
        this.highScoreService = Container.get(HighScoresService);
        this.vpNamesService = Container.get(VpNamesService);
        this.dbDictionaryService = Container.get(DbDictionariesService);
    }

    private configureRouter() {
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

        this.router.get('/vp-names', async (req: Request, res: Response) => {
            const names = await this.vpNamesService.getNames();
            res.json(names);
        });

        this.router.post('/vp-names', async (req: Request, res: Response) => {
            const names = await this.vpNamesService.addVP(req.body);
            res.json(names);
        });
        this.router.patch('/vp-names', async (req: Request, res: Response) => {
            const names = await this.vpNamesService.updateVP(req.body);
            res.json(names);
        });
        this.router.delete('/vp-names/:name', async (req: Request, res: Response) => {
            const names = await this.vpNamesService.deleteVP(req.params.name);
            res.json(names);
        });

        this.router.get('/dictionaries', async (req: Request, res: Response) => {
            const dictionaries = await this.dbDictionaryService.getDictionaries();
            res.json(dictionaries);
        });

        this.router.post('/dictionaries', async (req: Request, res: Response) => {
            const response = await this.dbDictionaryService.addDictionary(req.body);
            res.status(200).json(response);
        });
        this.router.patch('/dictionaries', async (req: Request, res: Response) => {
            const dictionaries = await this.dbDictionaryService.updateDictionary(req.body);
            res.json(dictionaries);
        });
        this.router.delete('/dictionaries/:id', async (req: Request, res: Response) => {
            const dictionaries = await this.dbDictionaryService.deleteDictionary(req.params.id);
            res.json(dictionaries);
        });

        this.router.get('/dictionaries/download/:id', async (req: Request, res: Response) => {
            const dictionary = await this.dbDictionaryService.downloadDictionary(req.params.id);
            res.download(dictionary);
            // res.status(200).json(dictionary);
        });
    }
}
