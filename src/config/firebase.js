import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, "firebase-key.json");

let firebaseInitialized = false;

export const initFirebase = () => {
  if (firebaseInitialized) return;

  try {
    let serviceAccount;
    
    // Check if running on Render (using env vars)
    if (process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      };
    } 
    // Local development (using file)
    else if (existsSync(keyPath)) {
      serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
    } 
    else {
      console.log("⚠️ Firebase key not found — push notifications disabled");
      return;
    }

    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    firebaseInitialized = true;
    console.log("✅ Firebase Admin initialized");
  } catch (err) {
    console.log("⚠️ Firebase init failed:", err.message);
  }
};

export const sendPush = async (fcmToken, title, body) => {
  if (!firebaseInitialized || !fcmToken) return;

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      webpush: {
        notification: { title, body, icon: "/logo.png" },
      },
    });
    console.log("✅ Push sent");
  } catch (err) {
    console.log("⚠️ Push failed:", err.message);
  }
};
