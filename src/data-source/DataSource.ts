import "reflect-metadata"
import { DataSource } from "typeorm"
import { cartusers } from "../entity/User"
import config from "../config/config"



export const AppDataSource = new DataSource({

    type: "mongodb",
    url: config.DB_URL,
    useNewUrlParser: true,
    synchronize: false,
    logging: true,
    useUnifiedTopology: true,
    entities: [cartusers],
    migrations: [],
    subscribers: []
   
})
