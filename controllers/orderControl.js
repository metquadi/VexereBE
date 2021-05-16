const Order = require("../models/orderModel")
const Trip = require("../models/tripModel")

const getOrder = async (req, res) => {
    try {
        const foundOrder = await Order.find().
            populate('userID tripID carID brandID',
                'username email phoneNumber startedDate departureTime brandName licensePlate -_id')
        // if (foundOrder.length === 0) {
        //     return res.status(404).send({ message: 'Not Found Order' })
        // }
        res.status(200).send(foundOrder)
    } catch (error) {
        console.log(error)
        res.status(500).send({ meesage: 'Something went wrong!' })
    }
}

const getOrderFutureByUser = async (req, res) => {
    try {
        const foundOrder = await Order.find({ userID: req.user._id })
            .populate('tripID brandID carID', 'startedDate departureTime brandName licensePlate')
        const filterOrder = foundOrder.filter(item => item.tripID.departureTime >= new Date())
        res.status(200).send(filterOrder)
    } catch (error) {
        console.log(error)
        res.status(500).send({ meesage: 'Something went wrong!' })
    }
}

const getOrderPassByUser = async (req, res) => {
    try {
        const foundOrder = await Order.find({ userID: req.user._id })
            .populate('tripID brandID carID', 'startedDate departureTime brandName licensePlate')
        const filterOrder = foundOrder.filter(item => item.tripID.departureTime < new Date())
        res.status(200).send(filterOrder)
    } catch (error) {
        console.log(error)
        res.status(500).send({ meesage: 'Something went wrong!' })
    }
}

const deleteOrder = async (req, res) => {
    try {
        const { orderID } = req.query
        const foundOrder = await Order.findById(orderID)
        if (!foundOrder) {
            return res.status(404).send({ message: 'The order not found!' })
        }
        const foundTrip = await Trip.findById(foundOrder.tripID)
        if (!foundTrip) {
            return res.status(404).send({ message: 'Thr trip not found!' })
        }
        if (foundTrip.departureTime < new Date()) {
            return res.status(400).send({ message: 'The trip is over!' })
        }
        for (let index = 0; index < foundOrder.arrayOfSeat.length; index++) {
            const seat = foundOrder.arrayOfSeat[index];
            const foundSeat = foundTrip.arrayOfSeat.findIndex(
                item => item.seatName === seat && item.status === 'booked'
            )
            if (foundSeat === -1) {
                return res.status(400).send({ message: `Seat ${seat} has not been booked!` })
            }
            foundTrip.arrayOfSeat[foundSeat].userID = null
            foundTrip.arrayOfSeat[foundSeat].status = 'available'
        }
        await foundTrip.save()
        await Order.findByIdAndRemove(orderID)
        res.status(202).send({ message: 'The order has been deleted successfully' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ meesage: 'Something went wrong!' })
    }
}

const getProfit5Month = async (req, res) => {
    try {
        const current = new Date();

        const prev1Month = new Date(current.setMonth(current.getMonth() - 1));
        const formatPrev1 = prev1Month.toLocaleString('en-US', { month: '2-digit', year: 'numeric' })
        const firstDayPrev1 = new Date(prev1Month.getFullYear(), prev1Month.getMonth(), 1);
        const lastDayPrev1 = new Date(prev1Month.getFullYear(), prev1Month.getMonth() + 1, 0, 23, 59, 59, 999);

        const prev2Month = new Date(current.setMonth(current.getMonth() - 1));
        const formatPrev2 = prev2Month.toLocaleString('en-US', { month: '2-digit', year: 'numeric' })
        const firstDayPrev2 = new Date(prev2Month.getFullYear(), prev2Month.getMonth(), 1);
        const lastDayPrev2 = new Date(prev2Month.getFullYear(), prev2Month.getMonth() + 1, 0, 23, 59, 59, 999);

        const prev3Month = new Date(current.setMonth(current.getMonth() - 1));
        const formatPrev3 = prev3Month.toLocaleString('en-US', { month: '2-digit', year: 'numeric' })
        const firstDayPrev3 = new Date(prev3Month.getFullYear(), prev3Month.getMonth(), 1);
        const lastDayPrev3 = new Date(prev3Month.getFullYear(), prev3Month.getMonth() + 1, 0, 23, 59, 59, 999);

        const prev4Month = new Date(current.setMonth(current.getMonth() - 1));
        const formatPrev4 = prev4Month.toLocaleString('en-US', { month: '2-digit', year: 'numeric' })
        const firstDayPrev4 = new Date(prev4Month.getFullYear(), prev4Month.getMonth(), 1);
        const lastDayPrev4 = new Date(prev4Month.getFullYear(), prev4Month.getMonth() + 1, 0, 23, 59, 59, 999);

        const prev5Month = new Date(current.setMonth(current.getMonth() - 1));
        const formatPrev5 = prev5Month.toLocaleString('en-US', { month: '2-digit', year: 'numeric' })
        const firstDayPrev5 = new Date(prev5Month.getFullYear(), prev5Month.getMonth(), 1);
        const lastDayPrev5 = new Date(prev5Month.getFullYear(), prev5Month.getMonth() + 1, 0, 23, 59, 59, 999);

        const sumProfitPre1Month = await Order.aggregate([
            {
                $match: {
                    $and: [
                        { departureTime: { $gte: firstDayPrev1 } },
                        { departureTime: { $lte: lastDayPrev1 } },
                    ]
                }
            },
            {
                $group:
                {
                    _id: null,
                    totalAmount: { $sum: '$totalPrice' }
                }
            }
        ])

        const sumProfitPre2Month = await Order.aggregate([
            {
                $match: {
                    $and: [
                        { departureTime: { $gte: firstDayPrev2 } },
                        { departureTime: { $lte: lastDayPrev2 } },
                    ]
                }
            },
            {
                $group:
                {
                    _id: null,
                    totalAmount: { $sum: '$totalPrice' }
                }
            }
        ])

        const sumProfitPre3Month = await Order.aggregate([
            {
                $match: {
                    $and: [
                        { departureTime: { $gte: firstDayPrev3 } },
                        { departureTime: { $lte: lastDayPrev3 } },
                    ]
                }
            },
            {
                $group:
                {
                    _id: null,
                    totalAmount: { $sum: '$totalPrice' }
                }
            }
        ])

        const sumProfitPre4Month = await Order.aggregate([
            {
                $match: {
                    $and: [
                        { departureTime: { $gte: firstDayPrev4 } },
                        { departureTime: { $lte: lastDayPrev4 } },
                    ]
                }
            },
            {
                $group:
                {
                    _id: null,
                    totalAmount: { $sum: '$totalPrice' }
                }
            }
        ])

        const sumProfitPre5Month = await Order.aggregate([
            {
                $match: {
                    $and: [
                        { departureTime: { $gte: firstDayPrev5 } },
                        { departureTime: { $lte: lastDayPrev5 } },
                    ]
                }
            },
            {
                $group:
                {
                    _id: null,
                    totalAmount: { $sum: '$totalPrice' },
                }
            }
        ])

        let categoryArr = [formatPrev5, formatPrev4, formatPrev3, formatPrev2, formatPrev1]
        let dataArr = []
        if (sumProfitPre5Month.length > 0) {
            dataArr.push(sumProfitPre5Month[0].totalAmount)
        } else {
            dataArr.push(0)
        }
        if (sumProfitPre4Month.length > 0) {
            dataArr.push(sumProfitPre4Month[0].totalAmount)
        } else {
            dataArr.push(0)
        }
        if (sumProfitPre3Month.length > 0) {
            dataArr.push(sumProfitPre3Month[0].totalAmount)
        } else {
            dataArr.push(0)
        }
        if (sumProfitPre2Month.length > 0) {
            dataArr.push(sumProfitPre2Month[0].totalAmount)
        } else {
            dataArr.push(0)
        }
        if (sumProfitPre1Month.length > 0) {
            dataArr.push(sumProfitPre1Month[0].totalAmount)
        } else {
            dataArr.push(0)
        }

        res.status(200).send({
            categoryArr,
            dataArr
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({ meesage: 'Something went wrong!' })
    }
}

module.exports = { getOrder, getOrderFutureByUser, getOrderPassByUser, deleteOrder, getProfit5Month }