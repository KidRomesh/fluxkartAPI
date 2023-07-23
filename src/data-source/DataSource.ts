import "reflect-metadata"
import { DataSource } from "typeorm"
import { cartusers } from "../entity/cartusers"
import config from "../config/config"



const AppDataSource = new DataSource({

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

export const connectDatabase = async () => {

    const connection = await AppDataSource.initialize()
  
    return connection;
  };