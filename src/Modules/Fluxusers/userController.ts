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
    console.log(user.length)

    if (user.length > 0) {
        const linkPreced = user[0].linkPrecedence
        if (linkPreced == "Primary") {
            const user1 = await userRepository.find({ where: { linkedId: user[0].id } })
            // if (email || phone) {
            //     return res.status(200).send({
            //         "contact": {
            //             "primaryContactd": user[0].id,
            //             "emails": [user1[0].email, user[0].email],
            //             "phoneNumbers": [user1[0].phoneNumber, user[0].phoneNumber],
            //             "secondaryContactIds": [user[1].linkedId]
            //         }

            //     })

            // }
            return res.status(200).send({
                "contact": {
                    "primaryContactd": user[0].id,
                    "emails": [user1[0].email, user[0].email],
                    "phoneNumbers": [user1[0].phoneNumber, user[0].phoneNumber],
                    "secondaryContactIds": [user1[0].id]
                }

            })

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
        const createuser = create(req, res, next)
        return createuser
    }

}


async function update(req: Request, res: Response, next: NextFunction) {

    let email = req.body.email
    let phone = req.body.phoneNumber
    const date = Dayjs().format('YYYY-MM-DD HH:mm:ss.SSS+ss')

    const userRepo = (await coDB).getMongoRepository(cartusers)
    let user = await userRepo.find({ where: { email: email } })
    user = user.length == 0 ? await userRepo.find({ where: { phoneNumber: phone } }) : user

    let userLinkPreced = []
    userLinkPreced = user.map(user => user.linkPrecedence)
    let userCreated = []
    userCreated = user.map(user => user.createdAt)
    let indexTO = userLinkPreced.indexOf("Secondary")
    const user1 = await userRepo.findOne({ where: { id: user[indexTO].linkedId } })
    console.log("from update")

    if ((user.length >= 1) && (user[0].linkPrecedence == "Primary")) {
        console.log("GETTING USERS")

        // if (user[0].email == email && user[0].phoneNumber == phone) {
        //     const getuser = await getUser(req, res, next)
        //     return getuser


        // } else {
        //     user[0].email = email
        //     user[0].phoneNumber = phone
        //     user[0].updatedAt = date

        //     userRepo.save(user)
        //     return res.status(200).send({
        //         "contact": {
        //             "primaryContactd": user1.id,
        //             "emails": [user1.email, user[0].email],
        //             "phoneNumbers": [user1.phoneNumber, user[0].phoneNumber],
        //             "secondaryContactIds": [user[0].id]
        //         }
        //     })
        // }
        const getuser = await getUser(req, res, next)
        return getuser
    } else if (user.length > 1) {
        let userfind = userLinkPreced.indexOf("Primary")
        let userfind1 = userLinkPreced.indexOf("Secondary")
        if ((user[userfind].id == user[userfind1].linkedId)) {

            if (user[userfind].email == user[userfind1].email || user[userfind].phoneNumber == user[userfind1].phoneNumber) {

                if (user[userfind1].linkPrecedence == "Secondary") {
                    user[userfind1].email = email
                    user[userfind1].phoneNumber = phone
                    user[userfind1].updatedAt = date

                    userRepo.save(user)
                    return res.status(200).send({
                        "contact": {
                            "primaryContactd": user1.id,
                            "emails": [user1.email, user[0].email],
                            "phoneNumbers": [user1.phoneNumber, user[0].phoneNumber],
                            "secondaryContactIds": [user[0].id]
                        }
                    })

                }
            } else {
                user[userfind].email = email
                user[userfind].phoneNumber = phone
                user[userfind].updatedAt = date

                userRepo.save(user)
                return res.status(200).send({
                    "contact": {
                        "primaryContactd": user1.id,
                        "emails": [user1.email, user[0].email],
                        "phoneNumbers": [user1.phoneNumber, user[0].phoneNumber],
                        "secondaryContactIds": [user[0].id]
                    }
                })
            }


        } else {

            const findVal = (acc: any, curr: any) => {
                if (acc > curr) {
                    return curr
                } else {
                    return acc
                }
            }
            const findlesser = await userCreated.reduce(findVal)

            const indexTo = userCreated.indexOf(findlesser)

            if (indexTo == -1) {
                return res.status(500).json({
                    status: 500,
                    message: 'Internal server error',
                    data: 'no data found'
                });
            } else {
                user[indexTo].email = email
                user[indexTo].phoneNumber = phone
                user[indexTo].updatedAt = date
                user[indexTo].linkPrecedence = "Secondary"
                user[indexTo].linkedId = user[indexTo - 1].id

                userRepo.save(user)
                return res.status(200).send({
                    "contact": {
                        "primaryContactd": user[indexTo - 1].id,
                        "emails": [user[indexTo - 1].email, user[indexTo].email],
                        "phoneNumbers": [user[indexTo - 1].phoneNumber, user[0].phoneNumber],
                        "secondaryContactIds": [user[indexTo].id]
                    }
                })
            }



        }

    } else {
        const createSec = await createSeondary(req, res, next)
        return createSec
    }



}

async function validate(req: Request, res: Response, next: NextFunction) {


    var mail = req.body.email
    var phone = req.body.phoneNumber
    let usermail = []
    let userPhone = []

    console.log("validation started")
    console.log(mail, phone)

    const userRepository = (await coDB).getMongoRepository(cartusers)
    let user = await userRepository.find({ where: { phoneNumber: phone } })
    user = user.length == 0 ? (await userRepository.find({ where: { email: mail } })) : user
    console.log("length", user.length)
    // if (user.length == 0) {
    //     console.log("inside IF")
    //     user = await userRepository.find({ where: { email: mail } })
    //     console.log(user)
    //     return user
    // }

    console.log(user[0])


    if (user.length >= 1) {

        usermail = user.map(user => user.email)
        userPhone = user.map(user => user.phoneNumber)


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
        if ((findSimilar === mail && findSimPhone === phone) || (findSimilar) || (findSimPhone)) {

            const getuser = await getUser(req, res, next)
            return getuser

        } else if ((findSimilar === mail && findSimPhone === "new") || (findSimPhone === phone && findSimilar === "new")) {
            const updateUser = await update(req, res, next)
            return updateUser
        } else {
            const secUser = await createSeondary(req, res, next)
            return secUser
        }
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
    if (user.length == 0) {
        const user1 = new cartusers()

        user1.id = Math.floor(Math.random() * 8) + 1
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
        const findVal = await validate(req, res, next)
        return findVal
    }




}

async function createSeondary(req: Request, res: Response, next: NextFunction) {

    var email = req.body.email
    var phone = req.body.phoneNumber

    const date = Dayjs().format('YYYY-MM-DD HH:mm:ss.SSS+ss')
    console.log("Inserting a secondary user into the database...")
    const userRepository = (await coDB).getMongoRepository(cartusers)

    let user = await userRepository.find({ where: { phoneNumber: phone } })
    user = user.length == 0 ? await userRepository.find({ where: { email: email } }) : user

    if (user.length == 1 && user[0].linkPrecedence == "Primary") {

        const user1 = new cartusers()

        user1.id = Math.floor(Math.random() * 8) + 1
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
        const findVal = await validate(req, res, next)
        return findVal
    }




}

const identify = async (req: Request, res: Response, next: NextFunction) => {
    var mail = req.body.email
    var phone = req.body.phoneNumber
    console.log("identify started")
    console.log(mail, phone)

    const userRepository = (await coDB).getMongoRepository(cartusers)

    let user = await userRepository.find({ where: { email: mail } })
    user = user.length == 0 ? await userRepository.find({ where: { phoneNumber: phone } }) : user
    let primary = user[0]
    let second = user[1]
    console.log(user.length)
    // console.log(primary.email)
    // console.log(second)
    if (user.length == 1 && ((user[0].email == mail) && (user[0].phoneNumber == phone))) {

        var linkPreced = primary.linkPrecedence
        if (linkPreced == "Primary") {
            // return res.status(200).send({
            //     "contact": {
            //         "primaryContactd": primary.id,
            //         "emails": [primary.email],
            //         "phoneNumbers": [primary.phoneNumber],
            //         "secondaryContactIds": []
            //     }
            // })
            const getuser = await getUser(req, res, next)
            return getuser
        } else {
            // const user1 = await userRepository.find({where:{id: user[0].linkedId}})
            // return res.status(200).send({
            //     "contact": {
            //         "primaryContactd": primary.id,
            //         "emails": [primary.email, user1[0].email],
            //         "phoneNumbers": [primary.phoneNumber,user[0].phoneNumber],
            //         "secondaryContactIds": [user1[0].id]
            //     }
            // })
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
    const userRepo = connect.getMongoRepository(cartusers);
    const user = await userRepo.findOne({ where: { email: mail } });
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


