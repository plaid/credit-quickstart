import express from "express";
import { v4 as uuidv4 } from "uuid";
import plaidClient from "../plaid.js";
import { getRecord, updateRecord, resetStore } from "../store.js";

const router = express.Router();

router.post("/create", async (req, res, next) => {
  try {
    const { firstName, lastName, dateOfBirth, email, phoneNumber, address } =
      req.body;

    const clientUserId = "user_" + uuidv4();

    const userCreateResponse = await plaidClient.userCreate({
      client_user_id: clientUserId,
      identity: {
        name: {
          given_name: firstName,
          family_name: lastName,
        },
        date_of_birth: dateOfBirth,
        emails: [{ data: email, primary: true }],
        phone_numbers: [{ data: phoneNumber, primary: true }],
        addresses: [
          {
            street_1: address.street,
            city: address.city,
            region: address.state,
            country: "US",
            postal_code: address.postalCode,
            primary: true,
          },
        ],
      },
    });

    const plaidUserId = userCreateResponse.data.user_id;

    await updateRecord({ clientUserId, plaidUserId, reportReady: false });

    console.log(`Created user with Plaid user_id: ${plaidUserId}`);
    res.json({ status: "success" });
  } catch (error) {
    next(error);
  }
});

router.post("/reset", async (req, res, next) => {
  try {
    await resetStore();
    res.json({ status: "success" });
  } catch (error) {
    next(error);
  }
});

router.get("/status", async (req, res, next) => {
  try {
    const record = getRecord();
    res.json({
      hasUser: !!record.plaidUserId,
      reportReady: record.reportReady,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
