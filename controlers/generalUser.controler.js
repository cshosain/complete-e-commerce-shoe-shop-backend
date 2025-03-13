import mongoose from "mongoose";
import GeneralUser from "../models/generalUser.model.js";

//CONTROLER FOR GET ALL GENERAL USERS
export const getAllGeneralUsers = async (req, res) => {
  try {
    const generalUsers = await GeneralUser.find({});
    res.status(200).json({ success: true, data: generalUsers });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

//ADD A NEW USER CONTROLER
export const addGeneralUser = async (req, res) => {
  const generalUser = req.body; //user will send this data
  if (
    !generalUser.firstName ||
    !generalUser.lastName ||
    !generalUser.email ||
    !generalUser.phone ||
    !generalUser.img
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }
  const newGeneralUser = new GeneralUser(generalUser);
  try {
    await newGeneralUser.save();
    res.status(201).json({ success: true, data: newGeneralUser });
  } catch (error) {
    console.log("Error while adding new generalUser: ", error);
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

//CONTROLER FOR UPDATE A USER
export const updateGeneralUser = async (req, res) => {
  const { id } = req.params;
  const generalUser = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid User Id" });
  }

  try {
    const updatedGeneralUser = await GeneralUser.findByIdAndUpdate(
      id,
      generalUser,
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedGeneralUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
    console.log(error);
  }
};

//CONTROLER FUNCTION FOR DELETE A USER
export const deleteGeneralUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid User Id" });
  }
  try {
    await GeneralUser.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
    console.log(error);
  }
};
