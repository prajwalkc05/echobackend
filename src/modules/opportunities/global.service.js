import axios from "axios";

const techKeywords = ["react", "node", "python", "java", "mongodb", "javascript", "typescript", "aws", "docker", "kubernetes", "express", "angular", "vue", "sql", "css"];

const extractSkills = (text = "") => {
  const lower = text.toLowerCase();
  return techKeywords.filter(s => lower.includes(s));
};

export const fetchRemotiveJobs = async () => {
  try {
    const res = await axios.get("https://remotive.com/api/remote-jobs", { timeout: 8000 });
    return res.data.jobs.slice(0, 15).map(job => ({
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      type: "job",
      url: job.url,
      skills: extractSkills(job.description),
      source: "Remotive",
    }));
  } catch {
    return [];
  }
};

export const fetchArbeitJobs = async () => {
  try {
    const res = await axios.get("https://www.arbeitnow.com/api/job-board-api", { timeout: 8000 });
    return res.data.data.slice(0, 15).map(job => ({
      title: job.title,
      company: job.company_name,
      location: job.location || "Remote",
      type: "job",
      url: job.url,
      skills: extractSkills(job.description || ""),
      source: "Arbeitnow",
    }));
  } catch {
    return [];
  }
};

export const fetchAllGlobalJobs = async () => {
  const [remotive, arbeit] = await Promise.all([
    fetchRemotiveJobs(),
    fetchArbeitJobs(),
  ]);

  const all = [...remotive, ...arbeit];

  // Deduplicate
  return Array.from(
    new Map(all.map(j => [j.title + j.company, j])).values()
  ).slice(0, 30);
};
