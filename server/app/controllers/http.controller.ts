// import { LeaderBoardService } from '@app/services/leaderboard.service';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

// const HTTP_STATUS_CREATED = 201;
// export type Message = { title: string; body: string };

@Service()
export class HttpController {
    router: Router;

    constructor(private readonly dictionnaryService: DictionnaryService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.get('/dictionnaries', async (req: Request, res: Response) => {
            const dictionnaries = await Promise.all(this.dictionnaryService.getDictionnaries());
            res.json(dictionnaries);
        });
    }
}
