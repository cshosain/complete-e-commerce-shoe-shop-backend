import axios from "axios";
import paymentModel from "../models/payment.model.js";
import globals from "node-global-storage";
import pkg from "node-global-storage";
const { getValue, setValue } = pkg;
import { v4 as uuidv4 } from "uuid";
dotenv.config();
class paymentController {
  bkash_headers = async () => {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: globals.getValue("id_token"),
      "x-app-key": process.env.bkash_api_key,
    };
  };

  payment_create = async (req, res) => {
    const apiUrlRoot =
      "https://complete-e-commerce-shoe-shop-backend.onrender.com" ||
      "http://localhost:3000";
    const { amount, userId } = req.body;
    globals.setValue("userId", userId);
    try {
      const { data } = await axios.post(
        process.env.bkash_create_payment_url,
        {
          mode: "0011",
          payerReference: " ",
          callbackURL: `${apiUrlRoot}/api/bkash/payment/callback`,
          amount: amount,
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: "Inv" + uuidv4().substring(0, 5),
        },
        {
          headers: await this.bkash_headers(),
        }
      );
      return res.status(200).json({ bkashURL: data.bkashURL });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  };

  call_back = async (req, res) => {
    const { paymentID, status } = req.query;

    if (status === "cancel" || status === "failure" || status !== "success") {
      console.log("failed status: ", status);
      return res.redirect(
        `${process.env.FRONTEND_URL_PRODUCTION}/error?message=${status}`
      );
    }
    if (status === "success") {
      try {
        const { data } = await axios.post(
          process.env.bkash_execute_payment_url,
          { paymentID },
          {
            headers: await this.bkash_headers(),
          }
        );
        if (data && data.statusCode === "0000") {
          //const userId = globals.get('userId')
          await paymentModel.create({
            userId: Math.random() * 10 + 1,
            paymentID,
            trxID: data.trxID,
            date: data.paymentExecuteTime,
            amount: parseInt(data.amount),
          });

          return res.redirect(`${process.env.FRONTEND_URL_PRODUCTION}/success`);
        } else {
          return res.redirect(
            `${process.env.FRONTEND_URL_PRODUCTION}/error?message=${data.statusMessage}`
          );
        }
      } catch (error) {
        console.log(error);
        return res.redirect(
          `${process.env.FRONTEND_URL_PRODUCTION}/error?message=${error.message}`
        );
      }
    }
  };

  refund = async (req, res) => {
    const { trxID } = req.params;

    try {
      const payment = await paymentModel.findOne({ trxID });

      const { data } = await axios.post(
        process.env.bkash_refund_transaction_url,
        {
          paymentID: payment.paymentID,
          amount: payment.amount,
          trxID,
          sku: "payment",
          reason: "cashback",
        },
        {
          headers: await this.bkash_headers(),
        }
      );
      if (data && data.statusCode === "0000") {
        return res.status(200).json({ message: "refund success" });
      } else {
        return res.status(404).json({ error: "refund failed" });
      }
    } catch (error) {
      return res.status(404).json({ error: "refund failed" });
    }
  };
}

export default new paymentController();
