import fs from "fs/promises";

const USER_DATA_FILE = "user_data.json";

const DEFAULT_RECORD = {
  clientUserId: null,
  plaidUserId: null,
  reportReady: false,
  homeLending: false,
  gseSharing: false,
  employmentRefreshRun: false,
  enabledProducts: ["network_insights", "cashflow_insights", "lend_score"],
};

let userRecord = { ...DEFAULT_RECORD };

const readFromDisk = async () => {
  try {
    const data = await fs.readFile(USER_DATA_FILE, { encoding: "utf8" });
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
};

export const loadStore = async () => {
  try {
    const record = await readFromDisk();
    if (record) {
      userRecord = record;
      console.log("Loaded user data from file.");
    } else {
      console.log("No user data file found. Starting fresh.");
      userRecord = { ...DEFAULT_RECORD };
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }
};

export const getRecord = () => userRecord;

export const updateRecord = async (updates) => {
  // Two processes (main + webhook server) share this file, so merge onto the
  // latest on-disk state rather than the in-memory copy to avoid clobbering.
  try {
    const onDisk = await readFromDisk();
    if (onDisk) userRecord = onDisk;
  } catch (error) {
    console.error("Error reading user data before update:", error);
  }
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
