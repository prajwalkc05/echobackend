import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { startCronJobs } from "./src/jobs/cronJobs.js";
import { initSocket } from "./src/socket.js";
import { initFirebase } from "./src/config/firebase.js";

const server = http.createServer(app);

initSocket(server);
initFirebase();

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  startCronJobs();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
