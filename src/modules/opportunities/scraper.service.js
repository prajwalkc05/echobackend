import axios from "axios";

// ── 1. JSEARCH API (RapidAPI - Free tier, real jobs) ──
export const fetchJSearchJobs = async () => {
  try {
    const apiKey = process.env.JSEARCH_API_KEY;
    if (!apiKey) {
      console.log("⚠️ JSearch API key missing");
      return [];
    }

    const res = await axios.get("https://jsearch.p.rapidapi.com/search", {
      params: { query: "software developer india", page: "1", num_pages: "1" },
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
      timeout: 10000,
    });

    return res.data.data.slice(0, 15).map(job => ({
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city || job.job_country || "India",
      url: job.job_apply_link,
      type: job.job_employment_type?.toLowerCase().includes("intern") ? "internship" : "job",
      skills: job.job_required_skills || [],
      source: "JSearch",
    }));
  } catch (err) {
    console.log("⚠️ JSearch failed:", err.message);
    return [];
  }
};

// ── 2. REMOTIVE API (Free, no key needed - remote jobs) ──
export const fetchRemotiveJobs = async () => {
  try {
    const res = await axios.get("https://remotive.com/api/remote-jobs", {
      params: { category: "software-dev", limit: 15 },
      timeout: 10000,
    });

    return res.data.jobs.slice(0, 15).map(job => ({
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      url: job.url,
      type: "job",
      skills: job.tags || [],
      source: "Remotive",
    }));
  } catch (err) {
    console.log("⚠️ Remotive failed:", err.message);
    return [];
  }
};

// ── 3. ADZUNA API ──
export const fetchAdzunaJobs = async () => {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    if (!appId || !appKey) return [];

    const res = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=15&what=developer&where=india`,
      { timeout: 10000 }
    );

    return res.data.results.map(job => ({
      title: job.title,
      company: job.company?.display_name || "Unknown",
      location: job.location?.display_name || "India",
      url: job.redirect_url,
      type: "job",
      skills: [],
      source: "Adzuna",
    }));
  } catch (err) {
    console.log("⚠️ Adzuna failed:", err.message);
    return [];
  }
};

// ── STATIC FALLBACK ──
const staticFallback = [
  { title: "Software Developer", company: "TCS", location: "Bangalore", type: "job", url: "https://www.tcs.com/careers", skills: ["java", "python"], source: "Static" },
  { title: "Frontend Developer Intern", company: "Infosys", location: "Pune", type: "internship", url: "https://www.infosys.com/careers", skills: ["react", "javascript"], source: "Static" },
  { title: "Full Stack Developer", company: "Wipro", location: "Hyderabad", type: "job", url: "https://careers.wipro.com", skills: ["node", "react", "mongodb"], source: "Static" },
  { title: "Backend Developer Intern", company: "Razorpay", location: "Bangalore", type: "internship", url: "https://razorpay.com/jobs", skills: ["node", "mongodb"], source: "Static" },
  { title: "React Developer", company: "Flipkart", location: "Bangalore", type: "job", url: "https://www.flipkartcareers.com", skills: ["react", "javascript"], source: "Static" },
  { title: "Python Developer", company: "Zoho", location: "Chennai", type: "job", url: "https://careers.zohocorp.com", skills: ["python", "sql"], source: "Static" },
  { title: "Android Developer Intern", company: "Swiggy", location: "Bangalore", type: "internship", url: "https://careers.swiggy.com", skills: ["java", "kotlin"], source: "Static" },
  { title: "DevOps Engineer", company: "Ola", location: "Bangalore", type: "job", url: "https://ola.careers", skills: ["docker", "kubernetes", "aws"], source: "Static" },
  { title: "Smart India Hackathon", company: "Govt of India", location: "Pan India", type: "hackathon", url: "https://sih.gov.in", skills: ["javascript", "python", "react"], source: "Static" },
];

// ── MERGE ALL SOURCES ──
export const scrapeAllJobs = async () => {
  console.log("🔄 Fetching from all sources...");

  const [jsearch, remotive, adzuna] = await Promise.all([
    fetchJSearchJobs(),
    fetchRemotiveJobs(),
    fetchAdzunaJobs(),
  ]);

  const all = [...jsearch, ...remotive, ...adzuna];

  const unique = Array.from(
    new Map(all.map(j => [(j.title + j.company).toLowerCase(), j])).values()
  );

  console.log(`✅ Total unique jobs: ${unique.length} (JSearch: ${jsearch.length}, Remotive: ${remotive.length}, Adzuna: ${adzuna.length})`);

  return unique.length ? unique : staticFallback;
};

// Keep these exports for backward compatibility
export const scrapeInternshala = fetchJSearchJobs;
export const scrapeNaukri = fetchRemotiveJobs;
