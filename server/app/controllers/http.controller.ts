// import { LeaderBoardService } from '@app/services/leaderboard.service';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

@Service()
export class HttpController {
    router: Router;

    constructor(private readonly dictionnaryService: DictionnaryService) {
        this.configureRouter();
        this.dictionnaryService.init();
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.get('/dictionnaries', (req: Request, res: Response) => {
            const dictionnaries = this.dictionnaryService.getDictionnaries();
            res.json(dictionnaries);
        });
    }
}
