import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm"


@Entity()
export class cartusers {

    @ObjectIdColumn()
    Aid: ObjectId

    @Column()
    id : number

    @Column()
    email: string

    @Column()
    phoneNumber: string

    @Column()
    linkedId: number

    @Column()
    linkPrecedence: string

    @Column()
    createdAt: string

    @Column()
    updatedAt: string

    @Column()
    deletedAt: string
}
