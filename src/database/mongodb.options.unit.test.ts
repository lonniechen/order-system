import { MongodbOptions } from './mongodb.options';

describe('MongodbOptions', () => {
    it('should return typeOrmOptions', async () => {
        const mongodbOptions = new MongodbOptions('path');;

        expect(
            await mongodbOptions.createTypeOrmOptions()
        ).toBeDefined()
    })

});