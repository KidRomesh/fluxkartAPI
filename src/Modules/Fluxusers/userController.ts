import e, { Request, Response, NextFunction } from "express";
import { cartusers } from "../../entity/cartusers";
import Dayjs from "dayjs"
import { DataSource } from "typeorm";
import config from "../../config/config";
import { connectDatabase } from "../../data-source/DataSource";

const coDB = connectDatabase()

const connect = new DataSource({
    type: "mongodb",
    url: config.DB_URL,
    database: "users",
    useNewUrlParser: true,
    synchronize: false,
    logging: true,
    useUnifiedTopology: true,
    entities: [cartusers],
    migrations: [],
    subscribers: [],
});


const getUsers = async (req: Request, res: Response, next: NextFunction) => {

    const userRepository = (await coDB).getMongoRepository(cartusers)
    const users = await userRepository.find();

    if (users == null) {
        return res.status(400).json({
            status: 404,
            message: 'Either repository is empty or not found',
            data: 'no data found'
        });

    }
    else {

        return res.status(200).send({
            "contact": {
                "primaryContactd": users.map(users => users.id),
                "emails": [users.map(users => users.email)],
                "phoneNumbers": [users.map(users => users.phoneNumber)],
                "secondaryContactIds": [users.map(users => users.linkedId)]
            }

        })

    }


};
async function validate(req: Request, res: Response, next: NextFunction) {


    var mail = req.body.email
    var phone = req.body.phoneNumber
    let usermail = []
    let userPhone = []

    console.log("validation started")
    console.log(mail, phone)

    const userRepository = (await coDB).getMongoRepository(cartusers)
    let user = await userRepository.find({ where: { phoneNumber: phone } })


    let user2 = await userRepository.find({ where: { email: mail } })


    // console.log("length", user.length)

    console.log(user, user2)

    console.log()


    if (user.length >= 1) {

        usermail = user.map(user => user.email)
        usermail.push(mail)
        if (user2.length > 0) {
            let user2mail = user2[0].email
            usermail.push(user2mail)
        }


        userPhone = user.map(user => user.phoneNumber)
        if (user2.length > 0) {
            let user2phone = user2[0].phoneNumber
            userPhone.push(user2phone)
        }
        userPhone.push(phone)



        console.log(usermail, userPhone)

        const findVal = (acc: any, curr: any) => {

            if (curr == acc) {
                return curr
            } else {
                let result = "new"
                return result
            }
        }
        const findSimilar = usermail.reduce(findVal)
        const findSimPhone = userPhone.reduce(findVal)
        console.log(findSimPhone, findSimilar)
        if ((findSimilar === mail && findSimPhone === "new") || (findSimPhone === phone && findSimilar === "new")) {
            const secUser = await createSecondary(req, res, next)
            return secUser
        } else {
            const updateUser = await update(req, res, next)
            return updateUser
        }
    }




}


async function getUser(req: Request, res: Response, next: NextFunction) {

    var email = req.body.email
    var phone = req.body.phoneNumber

    console.log("getting users from get")
    const userRepository = (await coDB).getMongoRepository(cartusers);
    let user = await userRepository.find({ where: { email: email } })
    user = user.length == 0 ? await userRepository.find({ where: { phoneNumber: phone } }) : user
    let usermail = []
    let userPhone = []
    usermail = user.map(user => user.email)
    userPhone = user.map(user => user.phoneNumber)
    console.log(user.length, usermail, userPhone)

    if (user.length > 0 && (usermail.indexOf(email) != -1 && userPhone.indexOf(phone) != -1)) {
        console.log("hai")
        const linkPreced = user[0].linkPrecedence
        if (linkPreced == "Primary") {
            const user1 = await userRepository.find({ where: { linkedId: user[0].id } })
            if (user1.length == 0) {
                return res.status(200).send({
                    "contact": {
                        "primaryContactd": user[0].id,
                        "emails": [user[0].email],
                        "phoneNumbers": [user[0].phoneNumber],
                        "secondaryContactIds": []
                    }

                })
            } else {
                return res.status(200).send({
                    "contact": {
                        "primaryContactd": user[0].id,
                        "emails": [user1[0].email, user[0].email],
                        "phoneNumbers": [user1[0].phoneNumber, user[0].phoneNumber],
                        "secondaryContactIds": [user1[0].id]
                    }

                })
            }


        } else {
            console.log("getting linked ids")
            const user1 = await userRepository.find({ where: { id: user[0].linkedId } })
            return res.status(200).send({
                "contact": {
                    "primaryContactd": user[0].linkedId,
                    "emails": [user1[0].email, user[0].email],
                    "phoneNumbers": [user1[0].phoneNumber, user[0].phoneNumber],
                    "secondaryContactIds": [user[0].id]
                }

            })



        }
    } else {
        const validateUser = await validate(req, res, next)
        return validateUser
    }

}

async function create(req: Request, res: Response, next: NextFunction) {

    var email = req.body.email
    var phone = req.body.phoneNumber

    const date = Dayjs().format('YYYY-MM-DD HH:mm:ss.SSS+ss')
    console.log("Inserting a new user into the database...")
    const userRepository = (await coDB).getMongoRepository(cartusers)
    let user = await userRepository.find({ where: { email: email } })
    user = user.length == 0 ? await userRepository.find({ where: { phoneNumber: phone } }) : user
    const all = await userRepository.find()
    let id: any

    if (all.length == 0) {
        id = 1
    } else {

        let indLast = all[all.length - 1]

        let indLastId = indLast.id

        id = +indLastId
        id = id + 1

    }
    if (user.length == 0) {
        const user1 = new cartusers()

        user1.id = id.toString()
        user1.phoneNumber = phone
        user1.email = email
        user1.linkedId = null
        user1.linkPrecedence = "Primary"
        user1.createdAt = date
        user1.updatedAt = ""
        user1.deletedAt = ""

        await (await coDB).manager.save(user1)

        return res.status(200).send({
            "contact": {
                "primaryContactd": user1.id,
                "emails": [user1.email],
                "phoneNumbers": [user1.phoneNumber],
                "secondaryContactIds": []
            }

        })
    } else {
        const getuser = await getUser(req, res, next)
        return getuser
    }




}
async function createSecondary(req: Request, res: Response, next: NextFunction) {

    var email = req.body.email
    var phone = req.body.phoneNumber

    const date = Dayjs().format('YYYY-MM-DD HH:mm:ss.SSS+ss')
    console.log("Inserting a secondary user into the database...")
    const userRepository = (await coDB).getMongoRepository(cartusers)

    let user = await userRepository.find({ where: { phoneNumber: phone } })
    user = user.length == 0 ? await userRepository.find({ where: { email: email } }) : user
    const all = await userRepository.find()
    let id: any



    let indLast = all[all.length - 1]

    let indLastId = indLast.id

    id = +indLastId

    id = id + 1



    if (user.length == 1 && user[0].linkPrecedence == "Primary") {

        const user1 = new cartusers()

        user1.id = id.toString()
        user1.phoneNumber = phone
        user1.email = email
        user1.linkedId = user[0].id
        user1.linkPrecedence = "Secondary"
        user1.createdAt = date
        user1.updatedAt = ""
        user1.deletedAt = ""

        await (await coDB).manager.save(user1)

        return res.status(200).send({
            "contact": {
                "primaryContactd": user1.linkedId,
                "emails": [user[0].email, user1.email],
                "phoneNumbers": [user[0].phoneNumber, user1.phoneNumber],
                "secondaryContactIds": [user1.id]
            }

        })


    } else {
        const findVal = await update(req, res, next)
        return findVal
    }




}

async function update(req: Request, res: Response, next: NextFunction) {

    let email = req.body.email
    let phone = req.body.phoneNumber
    const date = Dayjs().format('YYYY-MM-DD HH:mm:ss.SSS+ss')

    const userRepo = (await coDB).getMongoRepository(cartusers)
    let user = await userRepo.find({ where: { email: email } })

    let user2 = await userRepo.find({ where: { phoneNumber: phone } })

    console.log(user, user2)

    let userLinkPreced = []
    userLinkPreced = user.map(user => user.linkPrecedence)
    let user2LinkPreced = user2[0].linkPrecedence
    userLinkPreced.push(user2LinkPreced)
    let userCreated = []
    userCreated = user.map(user => user.createdAt)
    let user2Created = user2[0].createdAt
    userCreated.push(user2Created)

    let usermail = []

    let userPhone = []


    usermail = user.map(user => user.email)
    let user2mail = user2[0].email
    usermail.push(user2mail)

    userPhone = user.map(user => user.phoneNumber)
    let user2phone = user2[0].phoneNumber
    userPhone.push(user2phone)


    console.log("from update")
    console.log(user)
    if (userLinkPreced.indexOf("Secondary") == -1) {

        console.log("both are primary Hence changing secondary mark 2")


        let userSec = await userRepo.find({ where: { email: email } })
        let userPrim = await userRepo.find({ where: { phoneNumber: phone } })

        let user2Date = userSec[0].id
        let user1Date = userPrim[0].id

        let userSecDate = +user2Date
        let userPrimDate = +user1Date

        console.log(userSecDate, userPrimDate)

        if (userSecDate > userPrimDate) {
            userSec[0].email = email
            userSec[0].phoneNumber = phone
            userSec[0].linkPrecedence = "Secondary"
            userSec[0].updatedAt = date
            userSec[0].linkedId = userPrim[0].id

            userRepo.save(userSec)
            return res.status(200).send({
                "contact": {
                    "primaryContactd": userSec[0].linkedId,
                    "emails": [user2[0].email, userSec[0].email],
                    "phoneNumbers": [user2[0].phoneNumber, userSec[0].phoneNumber],
                    "secondaryContactIds": [userSec[0].id]
                }

            })
        } else {
            userPrim[0].email = email
            userPrim[0].phoneNumber = phone
            userPrim[0].linkPrecedence = "Secondary"
            userPrim[0].updatedAt = date
            userPrim[0].linkedId = userSec[0].id

            userRepo.save(userPrim)
            return res.status(200).send({
                "contact": {
                    "primaryContactd": userPrim[0].linkedId,
                    "emails": [userSec[0].email, userPrim[0].email],
                    "phoneNumbers": [userSec[0].phoneNumber, userPrim[0].phoneNumber],
                    "secondaryContactIds": [userPrim[0].id]
                }

            })
        }


    }


}











const identify = async (req: Request, res: Response, next: NextFunction) => {
    var mail = req.body.email
    var phone = req.body.phoneNumber
    console.log("identify started")
    console.log(mail, phone)

    const userRepository = (await coDB).getMongoRepository(cartusers)

    let user = await userRepository.find({ where: { email: mail } })
    console.log(user.length)
    user = user.length == 0 ? await userRepository.find({ where: { phoneNumber: phone } }) : user
    let primary = user[0]

    console.log(primary)
    console.log(user)
    if (user.length == 1 && ((user[0].email == mail) || (user[0].phoneNumber == phone))) {
        var linkPreced = primary.linkPrecedence
        if (linkPreced == "Primary" || linkPreced == "Secondary") {
            const getuser = await getUser(req, res, next)
            return getuser
        }
    } else if (user.length == 0) {
        console.log("creation of user")
        let createUser = await create(req, res, next)
        return createUser
    } else {
        console.log("validation")
        let valid = await validate(req, res, next)
        return valid
    }




}





const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    var mail = req.body.email;
    var phone = req.body.phoneNumber
    const userRepo = connect.getMongoRepository(cartusers);
    const user = await userRepo.findOne({ where: { email: mail } && { phoneNumber: phone } });
    if (user != null) {
        await userRepo.remove(user);

        res.status(200).send({
            message: "Successfully deleted"
        })

    }
    else {
        res.status(200).send({
            status: 404,
            message: "No employee found"
        });
    }

};

export default { getUsers, identify, deleteUser }


