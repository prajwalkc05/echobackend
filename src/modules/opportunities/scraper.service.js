import axios from "axios";

const launchBrowser = async () => {
  try {
    const isProduction = process.env.RENDER || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.log('🚀 Using @sparticuz/chromium for production');
      const chromium = await import('@sparticuz/chromium');
      const puppeteerCore = await import('puppeteer-core');
      
      // Force chromium to use /tmp for cache to avoid ETXTBSY
      chromium.default.setHeadlessMode = true;
      chromium.default.setGraphicsMode = false;
      
      const executablePath = await chromium.default.executablePath();
      console.log('🔧 Chrome path:', executablePath);
      
      return await puppeteerCore.default.launch({
        args: [
          ...chromium.default.args,
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote',
        ],
        defaultViewport: chromium.default.defaultViewport,
        executablePath: executablePath,
        headless: true,
      });
    } else {
      console.log('💻 Using regular puppeteer for local');
      const puppeteer = await import('puppeteer');
      return await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  } catch (error) {
    console.log("⚠️ Puppeteer launch failed:", error.message);
    throw error;
  }
};

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ── 1. INTERNSHALA ──
export const scrapeInternshala = async () => {
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);

    await page.goto("https://internshala.com/jobs/computer-science-jobs/", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise(r => setTimeout(r, 4000));

    await page.evaluate(() => {
      const closeBtn = document.querySelector('#close_popup, .ic-24-cross, .close');
      if (closeBtn) closeBtn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    const jobs = await page.evaluate(() => {
      const cards = document.querySelectorAll('.individual_internship, .job_card, [id^="job_"]');
      return Array.from(cards).slice(0, 15).map(card => ({
        title: (
          card.querySelector('.job-title, .profile, .title, h3, .heading_4_5') ||
          card.querySelector('a[href*="/jobs/"]')
        )?.innerText?.trim() || null,
        company: card.querySelector('.company-name, .company_name, .link_display_like_text')?.innerText?.trim() || null,
        location: card.querySelector('.locations span, .location_link, .ic-16-location-outline')?.innerText?.trim() || "India",
        url: "https://internshala.com" + (card.querySelector('a[href^="/"]')?.getAttribute('href') || ""),
        type: "internship",
        skills: [],
        source: "Internshala",
      })).filter(j => j.title && j.company);
    });

    await browser.close();
    console.log(`✅ Internshala: ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.log("⚠️ Internshala failed:", err.message);
    if (browser) await browser.close();
    return [];
  }
};

// ── 2. NAUKRI ──
export const scrapeNaukri = async (query = "software-developer") => {
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

    await page.goto(`https://www.naukri.com/${query}-jobs-in-india`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    await page.waitForSelector(".srp-jobtuple-wrapper, .jobTuple, article", { timeout: 10000 }).catch(() => null);

    const jobs = await page.evaluate(() => {
      const selectors = [".srp-jobtuple-wrapper", ".jobTuple", "article.jobTuple"];
      let nodes = [];
      for (const sel of selectors) {
        nodes = document.querySelectorAll(sel);
        if (nodes.length) break;
      }

      return Array.from(nodes).slice(0, 15).map(job => ({
        title: job.querySelector("a.title, .jobTitle, .title")?.innerText?.trim() || null,
        company: job.querySelector(".comp-name, .subTitle, .companyName")?.innerText?.trim() || null,
        location: job.querySelector(".locWdth, .location, .ni-job-tuple-icon-srp-loc")?.innerText?.trim() || "India",
        url: job.querySelector("a")?.href || null,
        type: "job",
        skills: [],
        source: "Naukri",
      })).filter(j => j.title && j.company);
    });

    await browser.close();
    console.log(`✅ Naukri: ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.log("⚠️ Naukri failed:", err.message);
    if (browser) await browser.close();
    return [];
  }
};

// ── 3. ADZUNA API (Free, India jobs) ──
export const fetchAdzunaJobs = async () => {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) return [];

    const res = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=15&what=developer&where=india`,
      { timeout: 8000 }
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

  const [internshala, naukri, adzuna] = await Promise.all([
    scrapeInternshala(),
    scrapeNaukri(),
    fetchAdzunaJobs(),
  ]);

  const all = [...internshala, ...naukri, ...adzuna];

  // Deduplicate by title + company
  const unique = Array.from(
    new Map(all.map(j => [(j.title + j.company).toLowerCase(), j])).values()
  );

  console.log(`✅ Total unique jobs: ${unique.length} (Internshala: ${internshala.length}, Naukri: ${naukri.length}, Adzuna: ${adzuna.length})`);

  // Use fallback if all sources failed
  return unique.length ? unique : staticFallback;
};
