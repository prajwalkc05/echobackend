import cron from "node-cron";
import { scrapeAllJobs } from "../modules/opportunities/scraper.service.js";
import Opportunity from "../modules/opportunities/opportunities.model.js";

const refreshAllJobs = async () => {
  try {
    const jobs = await scrapeAllJobs();
    if (jobs.length) {
      await Opportunity.deleteMany({});
      await Opportunity.insertMany(jobs);
      console.log(`✅ Jobs refreshed: ${jobs.length} total`);
    }
  } catch (err) {
    console.log("⚠️ Job refresh failed:", err.message);
  }
};

export const startCronJobs = () => {
  cron.schedule("0 */6 * * *", async () => {
    console.log("🔄 Cron: Refreshing all jobs...");
    await refreshAllJobs();
  });

  // Delay startup fetch by 3s to ensure DB is ready
  setTimeout(() => refreshAllJobs(), 3000);

  console.log("✅ Cron jobs started");
};
