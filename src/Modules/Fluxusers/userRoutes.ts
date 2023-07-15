import express from "express";

import userController from "./userController";

const router = express.Router();

router.get('/getAll', userController.getUsers);

router.post('/identify', userController.identify);

router.post('/delete', userController.deleteUser);



export = router;