import "reflect-metadata"
import { DataSource } from "typeorm"
import { fluxUsers } from "./entity/User"

const uri = "mongodb+srv://admin:admin@web0.jvf7ui1.mongodb.net/users"

export const AppDataSource = new DataSource({
    type: "mongodb",
    url: uri,
    useNewUrlParser:true,
    synchronize: false,
    logging: true,
    useUnifiedTopology: true,
    entities: [fluxUsers],
    migrations: [],
    subscribers: [],
})
