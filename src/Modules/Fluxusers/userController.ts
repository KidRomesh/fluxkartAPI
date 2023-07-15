import { Request, Response, NextFunction } from "express";
import { cartusers } from "../../entity/User";
import Dayjs from "dayjs"
import { AppDataSource } from "../../data-source/DataSource";
import { DataSource } from "typeorm";
import config from "../../config/config";


const connect = new DataSource({
    type: "mongodb",
    url: config.DB_URL,
    useNewUrlParser: true,
    synchronize: false,
    logging: true,
    useUnifiedTopology: true,
    entities: [cartusers],
    migrations: [],
    subscribers: [],
});


const getUsers = async (res: Response) => {

    const userRepository = connect.getMongoRepository(cartusers);
    const users = await userRepository.find();

    if (users == null) {
        res.status(404).send({
            status: 404,
            message: 'Either repository is empty or not found'
        });
    }
    else {

        for (var i = 0; i < users.length; i++) {
            console.log(res)
            return res.status(200).send({


                "contact": {
                    "primaryContactd": users[i].id,
                    "emails": [users[i].email],
                    "phoneNumbers": [users[i].phoneNumber],
                    "secondaryContactIds": [users[i].linkedId]
                }

            });

        }


    }


};


async function update(email, mobile) {



}

async function getEmail(email: any, res: Response) {

    const userRepository = AppDataSource.getMongoRepository(cartusers);
    const user = await userRepository.findOne({ where: { email: email } })

    if (user) {
        const linkPreced = user.linkPrecedence
        if (linkPreced == "Primary") {
            return res.status(200).send({
                "contact": {
                    "primaryContactd": user.id,
                    "emails": [user.email],
                    "phoneNumbers": [user.phoneNumber],
                    "secondaryContactIds": []
                }

            })

        } else {
            const userPrim = await userRepository.findOne({ where: { id: user.linkedId } })
            return res.status(200).send({
                "contact": {
                    "primaryContactd": userPrim.id,
                    "emails": [userPrim.email, user.email],
                    "phoneNumbers": [userPrim.phoneNumber, user.phoneNumber],
                    "secondaryContactIds": [user.id]
                }

            })
        }
    } else {
        create(email, null, res)
    }

}

async function getPhone(phone: any, res: Response) {
    const userRepository = AppDataSource.getMongoRepository(cartusers);
    const user = await userRepository.findOne({ where: { phoneNumber: phone } })

    if (user) {
        const linkPreced = user.linkPrecedence
        if (linkPreced == "Primary") {
            return res.status(200).send({
                "contact": {
                    "primaryContactd": user.id,
                    "emails": [user.email],
                    "phoneNumbers": [user.phoneNumber],
                    "secondaryContactIds": []
                }

            })

        } else {
            const userPrim = await userRepository.findOne({ where: { id: user.linkedId } })
            return res.status(200).send({
                "contact": {
                    "primaryContactd": userPrim.id,
                    "emails": [userPrim.email, user.email],
                    "phoneNumbers": [userPrim.phoneNumber, user.phoneNumber],
                    "secondaryContactIds": [user.id]
                }

            })
        }
    } else {
        create(null, phone, res)
    }

}

async function create(mail: any, phone: any, res: Response) {

    const date = Dayjs().format('YYYY-MM-DD HH:mm:ss.SSS+ss')
    console.log("Inserting a new user into the database...")
    const user1 = new cartusers()
    user1.id =
        user1.phoneNumber = phone
    user1.email = mail
    user1.linkedId = null
    user1.linkPrecedence = "Primary"
    user1.createdAt = date
    user1.updatedAt = ""
    user1.deletedAt = ""

    await AppDataSource.manager.save(user1)

    return res.status(200).send({
        "contact": {
            "primaryContactd": user1.id,
            "emails": [user1.email],
            "phoneNumbers": [user1.phoneNumber],
            "secondaryContactIds": []
        }

    })



}

const identify = async (req: Request, res: Response) => {



    const userRepository = AppDataSource.getMongoRepository(cartusers);

    var mail = req.body.email;
    var phone = req.body.phoneNumber
    var filter: any
    var primaID: number
    var user: any
    var userPhone

    if (mail != null && phone == null) {
        filter = 1
        return filter
    } else if (mail == null && phone != null) {
        filter = 2
        return filter
    } else {
        user = await userRepository.findOne({ where: { email: mail } })
        userPhone = await userRepository.findOne({ where: { phoneNumber: phone } })

    }


    if ((userPhone == null && user == null) && (filter != 1 && filter != 2)) {
        create(mail, phone, res)
    } else {

        if (filter == 1) {
            getEmail(mail, res)
        }
        if (filter == 2) {
            getPhone(phone, res)
        }
        if (user != null && userPhone != null) {

            var mailUser: any = user.email
            var phoneUserMail: any = userPhone.email

            var mailUserMobile: any = user.phoneNumber
            var phoneUserMobile: any = userPhone.phoneNumber

            var maillinkPreced = user.linkPreced
            var phoneLinkPreced = userPhone.linkPreced

            if (mailUser == phoneUserMail && mailUserMobile == phoneUserMobile && maillinkPreced == "Primary") {
                getEmail(mailUser, res)
            }
            else if (mailUser == phoneUserMail && mailUserMobile == phoneUserMobile && maillinkPreced != "Primary") {
                getEmail(mailUser, res)
            }
            else {
                if (mailUser != phoneUserMail && mailUserMobile == phoneUserMobile) {
                    if (maillinkPreced == "Primary" && phoneLinkPreced == "Primary") {
                        var mailUserCreated: any = user.createdAt
                        var phoneUserCreated: any = userPhone.createdAt
                    }
                }
            }

        }







    }

}





const deleteUser = async (req: Request, res: Response) => {
    var mail = req.body.email;
    const userRepo = AppDataSource.getMongoRepository(cartusers);
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


