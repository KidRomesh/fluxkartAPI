import "reflect-metadata";
import express, { Express } from "express";
import morgan from "morgan"
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { DataSource } from "typeorm"
import config from "./config/config";
import { cartusers } from "./entity/cartusers"
import userRoutes from "./Modules/Fluxusers/userRoutes";
import Dayjs from "dayjs";



const connect = new DataSource({
    type: "mongodb",
    url: config.DB_URL,
    database:"users",
    useNewUrlParser: true,
    synchronize: false,
    logging: true,
    useUnifiedTopology: true,
    entities: [cartusers],
    migrations: [],
    subscribers: [],
});



connect.initialize().then(async () => {

    const app: Express = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan("dev"));
    app.use(express.json());

    app.use(function (req: any, res: any, next: any) {

        var send = res.send;
        var sent = false;
        res.send = function (data: any) {
            if (sent) return;
            send.bind(res)(data);
            sent = true;
        };
        next();

    });

    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use("/", userRoutes)

    const httpServer = http.createServer(app);
    httpServer.listen(config.port, () =>
        console.log(`The server is running in port ${config.port}`)
    );


    console.log("Loading users from the database...")
    const users1 = connect.getMongoRepository(cartusers)
    const users = await users1.find()
    console.log("Loaded users: ", users)


}).catch(error => console.log(error))
