export const template2 = (data = {}) => `
<html>
<head>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 210mm;
    height: 297mm;
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 11px;
    overflow: hidden;
  }
  .container {
    display: grid;
    grid-template-columns: 32% 68%;
    width: 210mm;
    height: 297mm;
  }
  .left {
    background: #1a2332;
    color: #e0e6f0;
    padding: 10mm 7mm;
    display: flex;
    flex-direction: column;
    gap: 5mm;
  }
  .right {
    background: #ffffff;
    padding: 10mm 9mm;
    display: flex;
    flex-direction: column;
    gap: 5mm;
  }
  .photo-wrap { text-align: center; }
  .photo-wrap img {
    width: 26mm; height: 26mm;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #4a90d9;
  }
  .left h2 {
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 2.5px;
    color: #4a90d9;
    border-bottom: 1px solid #2d3f55;
    padding-bottom: 2mm;
    margin-bottom: 3mm;
  }
  .left p {
    font-size: 10px;
    line-height: 1.5;
    color: #c0cce0;
    margin-bottom: 1.5mm;
  }
  .skill-bar-wrap { margin-bottom: 2mm; }
  .skill-label { font-size: 10px; color: #c0cce0; margin-bottom: 1mm; }
  .skill-bar { background: #2d3f55; height: 2mm; border-radius: 1mm; }
  .skill-fill { background: #4a90d9; height: 2mm; border-radius: 1mm; width: 80%; }
  .right-header { border-bottom: 3px solid #1a2332; padding-bottom: 4mm; margin-bottom: 2mm; }
  .right-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1a2332;
    letter-spacing: 0.5px;
    line-height: 1.2;
  }
  .right-header .title {
    font-size: 11px;
    color: #4a90d9;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 1.5mm;
  }
  .right-section h2 {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #1a2332;
    border-left: 3px solid #4a90d9;
    padding-left: 3mm;
    margin-bottom: 3mm;
  }
  .right-section p {
    font-size: 10px;
    line-height: 1.6;
    color: #444;
  }
  .exp-item { margin-bottom: 4mm; }
  .exp-title { font-size: 11px; font-weight: bold; color: #1a2332; }
  .exp-meta { font-size: 9px; color: #4a90d9; margin-bottom: 1.5mm; }
  .exp-item ul { padding-left: 4mm; }
  .exp-item ul li { font-size: 10px; line-height: 1.5; color: #444; margin-bottom: 1mm; }
  .proj-item { margin-bottom: 3mm; }
  .proj-name { font-size: 11px; font-weight: bold; color: #1a2332; }
  .proj-desc { font-size: 10px; color: #444; line-height: 1.5; }
  .proj-tech { font-size: 9px; color: #4a90d9; margin-top: 1mm; }
  .edu-item { margin-bottom: 3mm; }
  .edu-inst { font-size: 10px; font-weight: bold; color: #c0cce0; }
  .edu-deg { font-size: 10px; color: #8a9ab0; }
</style>
</head>
<body>
<div class="container">
  <div class="left">
    ${data.photo ? `<div class="photo-wrap"><img src="${data.photo}"/></div>` : ""}

    <div>
      <h2>Contact</h2>
      ${data.contact?.email ? `<p>✉ ${data.contact.email}</p>` : ""}
      ${data.contact?.phone ? `<p>✆ ${data.contact.phone}</p>` : ""}
      ${data.contact?.location ? `<p>⌖ ${data.contact.location}</p>` : ""}
      ${data.contact?.website ? `<p>⊕ ${data.contact.website}</p>` : ""}
    </div>

    <div>
      <h2>Skills</h2>
      ${(data.skills || []).map(s => `
        <div class="skill-bar-wrap">
          <div class="skill-label">${s}</div>
          <div class="skill-bar"><div class="skill-fill"></div></div>
        </div>`).join("")}
    </div>

    <div>
      <h2>Education</h2>
      ${(data.education || []).map(e => `
        <div class="edu-item">
          <div class="edu-inst">${e.institution}</div>
          <div class="edu-deg">${e.degree}</div>
          <p style="color:#6a7a90;font-size:9px;">${e.year}</p>
        </div>`).join("")}
    </div>

    ${data.languages?.length ? `
    <div>
      <h2>Languages</h2>
      ${data.languages.map(l => `<p>• ${l}</p>`).join("")}
    </div>` : ""}
  </div>

  <div class="right">
    <div class="right-header">
      <h1>${data.name || ""}</h1>
      <div class="title">${data.title || ""}</div>
    </div>

    <div class="right-section">
      <h2>Profile</h2>
      <p>${data.summary || ""}</p>
    </div>

    <div class="right-section">
      <h2>Experience</h2>
      ${(data.experience || []).map(e => `
        <div class="exp-item">
          <div class="exp-title">${e.role} — ${e.company}</div>
          <div class="exp-meta">${e.duration}</div>
          <ul>${(e.points || []).map(p => `<li>${p}</li>`).join("")}</ul>
        </div>`).join("")}
    </div>

    <div class="right-section">
      <h2>Projects</h2>
      ${(data.projects || []).map(p => `
        <div class="proj-item">
          <div class="proj-name">${p.name}</div>
          <div class="proj-desc">${p.description}</div>
          <div class="proj-tech">${(p.tech || []).join(" · ")}</div>
        </div>`).join("")}
    </div>
  </div>
</div>
</body>
</html>`;
