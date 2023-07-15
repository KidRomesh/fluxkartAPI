import "reflect-metadata";
import express, { Express } from "express";
import morgan from "morgan"
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { DataSource } from "typeorm"
import config from "./config/config";
import { fluxUsers } from "./entity/User"
import userRoutes from "./Modules/Fluxusers/userRoutes";



const connect = new DataSource({
    type: "mongodb",
    url: config.DB_URL,
    useNewUrlParser: true,
    synchronize: false,
    logging: true,
    useUnifiedTopology: true,
    entities: [fluxUsers],
    migrations: [],
    subscribers: [],
})

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

    app.use("/fluxKartAPI", userRoutes)

    const httpServer = http.createServer(app);
    httpServer.listen(config.port, () =>
        console.log(`The server is running in port ${config.port}`)
    );


    console.log("Loading users from the database...")
    const users1 = connect.getMongoRepository(fluxUsers)
    const users = await users1.find()
    //const mail = "romikhanna1301@gmail.com"

    // const user: any = await users1.findOne({ where: { email: mail  } });
    console.log("Loaded users: ", users)
    //console.log("Here you can setup and run express / fastify / any other framework.")

}).catch(error => console.log(error))
