export const calculateATSScore = (resume, jobDesc) => {
  const text = JSON.stringify(resume).toLowerCase();
  const words = jobDesc.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  let match = 0;
  words.forEach(word => { if (text.includes(word)) match++; });

  const score = Math.min(100, Math.round((match / words.length) * 100));
  return score;
};
