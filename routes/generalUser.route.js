import express from "express";
import {
  addGeneralUser,
  deleteGeneralUser,
  getAllGeneralUsers,
  updateGeneralUser,
} from "../controlers/generalUser.controler.js";

const router = express.Router();

//given routes are for general users
//GET USERS
router.get("/", getAllGeneralUsers);

//ADD A USER
router.post("/", addGeneralUser);

//UPDATE A USER
router.put("/:id", updateGeneralUser);

//DELETE A USER
router.delete("/:id", deleteGeneralUser);

export default router;
