import Opportunity from "./opportunities.model.js";

const staticFallback = [
  { title: "Software Developer", company: "TCS", location: "Bangalore", type: "job", url: "https://www.tcs.com/careers", skills: ["java", "python"], source: "India-Static" },
  { title: "Frontend Developer Intern", company: "Infosys", location: "Pune", type: "internship", url: "https://www.infosys.com/careers", skills: ["react", "javascript"], source: "India-Static" },
  { title: "Full Stack Developer", company: "Wipro", location: "Hyderabad", type: "job", url: "https://careers.wipro.com", skills: ["node", "react", "mongodb"], source: "India-Static" },
  { title: "Backend Developer Intern", company: "Razorpay", location: "Bangalore", type: "internship", url: "https://razorpay.com/jobs", skills: ["node", "mongodb"], source: "India-Static" },
  { title: "React Developer", company: "Flipkart", location: "Bangalore", type: "job", url: "https://www.flipkartcareers.com", skills: ["react", "javascript"], source: "India-Static" },
  { title: "Python Developer", company: "Zoho", location: "Chennai", type: "job", url: "https://careers.zohocorp.com", skills: ["python", "sql"], source: "India-Static" },
  { title: "Android Developer Intern", company: "Swiggy", location: "Bangalore", type: "internship", url: "https://careers.swiggy.com", skills: ["java", "kotlin"], source: "India-Static" },
  { title: "DevOps Engineer", company: "Ola", location: "Bangalore", type: "job", url: "https://ola.careers", skills: ["docker", "kubernetes", "aws"], source: "India-Static" },
  { title: "Smart India Hackathon", company: "Govt of India", location: "Pan India", type: "hackathon", url: "https://sih.gov.in", skills: ["javascript", "python", "react"], source: "India-Static" },
];

export const fetchOpportunities = async (filters = {}) => {
  let jobs = await Opportunity.find().limit(50).lean();

  if (!jobs.length) jobs = staticFallback;

  if (filters.type) jobs = jobs.filter(j => j.type === filters.type);
  if (filters.location) jobs = jobs.filter(j => j.location?.toLowerCase().includes(filters.location.toLowerCase()));
  if (filters.skills?.length) {
    const lower = filters.skills.map(s => s.toLowerCase());
    jobs = jobs.filter(j => j.skills?.some(s => lower.includes(s.toLowerCase())));
  }

  return jobs;
};
