import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, "firebase-key.json");

let firebaseInitialized = false;

export const initFirebase = () => {
  if (firebaseInitialized) return;

  if (!existsSync(keyPath)) {
    console.log("⚠️ Firebase key not found — push notifications disabled");
    return;
  }

  try {
    const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
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
