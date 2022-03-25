import { DataBaseController } from '@app/controllers/db.controller';
import { expect } from 'chai';

describe('Database Controller', () => {
    let dataBase: DataBaseController;

    beforeEach(async () => {
        dataBase = new DataBaseController();
    });

    it('should connect to DB', async () => {
        await dataBase.connect();
        expect(dataBase.db).to.not.equal(null);
    });
});
