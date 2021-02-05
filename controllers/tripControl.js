const Trip = require("../models/tripModel");
const Station = require("../models/stationModel");
const Car = require("../models/carModel");
const { Seat } = require("../models/seatModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");

const postTrip = async (req, res) => {
  try {
    const {
      departurePlace,
      arrivalPlace,
      startedDate,
      departureTime,
      carID,
      price,
    } = req.body;
    const foundStation = await Station.find().or([
      { _id: departurePlace },
      { _id: arrivalPlace },
    ]);
    if (foundStation.length !== 2) {
      return res.status(404).send({ message: "Invalid Station !" });
    }
    const foundCar = await Car.findById(carID);
    if (!foundCar) {
      return res.status(404).send({ message: "Invalid Car" });
    }
    const arrayOfSeat = [...new Array(foundCar.numberOfSeat)].map(
      (item, index) => {
        return new Seat({
          seatName: index + 1,
          status: "available",
        });
      }
    );
    const newTrip = new Trip({
      departurePlace,
      arrivalPlace,
      startedDate: startedDate + " 00:00:00",
      departureTime,
      arrayOfSeat,
      carID,
      price,
      statusActive: "Active",
    });
    const result = await newTrip.save();
    res.status(201).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong !" });
  }
};

const patchTrip = async (req, res) => {
  try {
    const { tripID, startedDate, departureTime, price } = req.body;
    const foundTrip = await Trip.findById(tripID);
    if (!foundTrip) {
      return res.status(404).send({ message: "Invalid Trip !" });
    }
    foundTrip.startedDate = startedDate + " 00:00:00";
    foundTrip.departureTime = departureTime;
    foundTrip.price = price;
    const result = await foundTrip.save();
    res.status(202).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong !" });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const { tripID } = req.query;
    const foundTrip = await Trip.findById(tripID);
    if (!foundTrip) {
      return res.status(404).send({ message: "Invalid Trip !" });
    }
    const findOrder = await Order.findOne({ tripID });
    if (findOrder) {
      return res.status(400).send({ message: "Trip was booked" });
    }
    foundTrip.statusActive = "Inactive";
    const result = await foundTrip.save();
    res.status(203).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong !" });
  }
};

const getTrip = async (req, res) => {
  try {
    const { departurePlace, arrivalPlace, startedDate } = req.query;
    const findTrip = await Trip.find().and([
      { departurePlace },
      { arrivalPlace },
      { startedDate: startedDate + " 00:00:00" },
    ]);
    if (findTrip.length === 0) {
      return res.status(404).send({ message: "Not Found Trip" });
    }
    res.status(200).send(findTrip);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong !" });
  }
};

const bookTrip = async (req, res) => {
  const { tripID } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const foundTrip = await Trip.findById(tripID).session(session);
    await Trip.create(
      [
        {
          userID: req.user._id,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
  }
};

module.exports = { postTrip, patchTrip, deleteTrip, getTrip };
