import fs from "fs/promises";

const USER_DATA_FILE = "user_data.json";

const DEFAULT_RECORD = {
  clientUserId: null,
  plaidUserId: null,
  reportReady: false,
};

let userRecord = { ...DEFAULT_RECORD };

export const loadStore = async () => {
  try {
    const data = await fs.readFile(USER_DATA_FILE, { encoding: "utf8" });
    userRecord = JSON.parse(data);
    console.log("Loaded user data from file.");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("No user data file found. Starting fresh.");
      userRecord = { ...DEFAULT_RECORD };
    } else {
      console.error("Error loading user data:", error);
    }
  }
};

export const getRecord = () => userRecord;

export const updateRecord = async (updates) => {
  userRecord = { ...userRecord, ...updates };
  try {
    await fs.writeFile(USER_DATA_FILE, JSON.stringify(userRecord, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
    console.log("User data written to file.");
  } catch (error) {
    console.error("Error writing user data:", error);
  }
};

export const resetStore = async () => {
  await updateRecord({ ...DEFAULT_RECORD });
};
