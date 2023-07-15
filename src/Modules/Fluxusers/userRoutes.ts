import express from "express";

import userController from "./userController";

const router = express.Router();
var res: any

router.get('/getall', userController.getUsers);

router.post('/identify', userController.identify);

router.post('/delete', userController.deleteUser);



export = router;