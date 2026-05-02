export const template5 = (data = {}) => `
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
    background: #f2ede8;
    overflow: hidden;
  }
  .header {
    background: #3a2f2f;
    color: white;
    padding: 7mm 10mm;
    display: flex;
    align-items: center;
    gap: 6mm;
  }
  .photo { width: 22mm; height: 22mm; border-radius: 50%; object-fit: cover; border: 2px solid #c8a27c; flex-shrink: 0; }
  .header-info h1 { font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
  .header-info .title { font-size: 10px; color: #c8a27c; letter-spacing: 2px; text-transform: uppercase; margin-top: 1.5mm; }
  .contact-bar {
    background: #c8a27c;
    padding: 2mm 10mm;
    display: flex;
    gap: 8mm;
    font-size: 9px;
    color: #3a2f2f;
    font-weight: 600;
  }
  .body {
    display: grid;
    grid-template-columns: 60% 40%;
    gap: 4mm;
    padding: 5mm 6mm;
    height: calc(297mm - 34mm);
  }
  .card {
    background: #fff;
    border-radius: 2mm;
    padding: 5mm;
    margin-bottom: 4mm;
    box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  }
  h2 {
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #3a2f2f;
    border-left: 3px solid #c8a27c;
    padding-left: 2.5mm;
    margin-bottom: 3mm;
  }
  p { font-size: 10px; line-height: 1.6; color: #333; }
  .skill-tag {
    display: inline-block;
    background: #f2ede8;
    color: #3a2f2f;
    border: 1px solid #c8a27c;
    padding: 1mm 3mm;
    border-radius: 2mm;
    font-size: 9px;
    margin: 1mm 1mm 0 0;
  }
  .exp-item { margin-bottom: 4mm; }
  .exp-title { font-size: 11px; font-weight: bold; color: #1a1a1a; }
  .exp-meta { font-size: 9px; color: #c8a27c; margin-bottom: 1.5mm; }
  .exp-item ul { padding-left: 4mm; }
  .exp-item ul li { font-size: 10px; line-height: 1.5; color: #333; margin-bottom: 1mm; }
  .proj-item { margin-bottom: 3mm; }
  .proj-name { font-size: 11px; font-weight: bold; color: #1a1a1a; }
  .proj-desc { font-size: 10px; color: #444; line-height: 1.5; }
  .proj-tech { font-size: 9px; color: #c8a27c; margin-top: 1mm; }
  .edu-item { margin-bottom: 3mm; }
  .edu-inst { font-size: 10px; font-weight: bold; }
  .edu-deg { font-size: 10px; color: #555; }
  .edu-year { font-size: 9px; color: #888; }
</style>
</head>
<body>
  <div class="header">
    ${data.photo ? `<img src="${data.photo}" class="photo"/>` : ""}
    <div class="header-info">
      <h1>${data.name || ""}</h1>
      <div class="title">${data.title || ""}</div>
    </div>
  </div>

  <div class="contact-bar">
    ${data.contact?.email ? `<span>✉ ${data.contact.email}</span>` : ""}
    ${data.contact?.phone ? `<span>✆ ${data.contact.phone}</span>` : ""}
    ${data.contact?.location ? `<span>⌖ ${data.contact.location}</span>` : ""}
    ${data.contact?.website ? `<span>⊕ ${data.contact.website}</span>` : ""}
  </div>

  <div class="body">
    <div class="main">
      <div class="card">
        <h2>Profile</h2>
        <p>${data.summary || ""}</p>
      </div>

      <div class="card">
        <h2>Experience</h2>
        ${(data.experience || []).map(e => `
          <div class="exp-item">
            <div class="exp-title">${e.role} — ${e.company}</div>
            <div class="exp-meta">${e.duration}</div>
            <ul>${(e.points || []).map(p => `<li>${p}</li>`).join("")}</ul>
          </div>`).join("")}
      </div>

      <div class="card">
        <h2>Projects</h2>
        ${(data.projects || []).map(p => `
          <div class="proj-item">
            <div class="proj-name">${p.name}</div>
            <div class="proj-desc">${p.description}</div>
            <div class="proj-tech">${(p.tech || []).join(" · ")}</div>
          </div>`).join("")}
      </div>
    </div>

    <div class="sidebar">
      <div class="card">
        <h2>Skills</h2>
        ${(data.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join("")}
      </div>

      <div class="card">
        <h2>Education</h2>
        ${(data.education || []).map(e => `
          <div class="edu-item">
            <div class="edu-inst">${e.institution}</div>
            <div class="edu-deg">${e.degree}</div>
            <div class="edu-year">${e.year}</div>
          </div>`).join("")}
      </div>

      ${data.languages?.length ? `
      <div class="card">
        <h2>Languages</h2>
        ${data.languages.map(l => `<p>• ${l}</p>`).join("")}
      </div>` : ""}
    </div>
  </div>
</body>
</html>`;
