import { Double } from "mongodb"
import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm"
import { Decimal128Extended } from "typeorm/driver/mongodb/bson.typings"

@Entity()
export class fluxUsers {

    @ObjectIdColumn()
    Aid: ObjectId

    @Column()
    id : number

    @Column()
    email: string

    @Column()
    phoneNumber: string

    @Column()
    linkedId: Double

    @Column()
    linkPrecedence: string

    @Column()
    createdAt: string

    @Column()
    updatedAt: string

    @Column()
    deletedAt: string
}
