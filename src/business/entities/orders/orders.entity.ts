import {
    Column,
    Entity,
    ObjectIdColumn
} from 'typeorm'
import { ObjectID } from 'mongodb'

@Entity('orders')
export class EntityOrders {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    origin: Array<string>;

    @Column()
    destination: Array<string>;

    @Column()
    distance: number;

    @Column()
    status: string;

    @Column()
    createdTimestamp: Date;

    @Column()
    updatedTimestamp: Date;
}