export const template4 = (data = {}) => `
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
    background: #fff;
    overflow: hidden;
  }
  .header {
    background: #0f4c5c;
    color: white;
    padding: 8mm 10mm;
    display: flex;
    align-items: center;
    gap: 6mm;
  }
  .photo { width: 24mm; height: 24mm; border-radius: 50%; object-fit: cover; border: 2px solid #5ab4c8; flex-shrink: 0; }
  .header-info { flex: 1; }
  .header-info h1 { font-size: 26px; font-weight: 700; letter-spacing: 0.5px; line-height: 1.2; }
  .header-info .title { font-size: 10px; color: #a8d8e8; letter-spacing: 2.5px; text-transform: uppercase; margin-top: 1.5mm; }
  .contact-bar {
    background: #5ab4c8;
    padding: 2.5mm 10mm;
    display: flex;
    gap: 8mm;
    font-size: 9px;
    color: #fff;
  }
  .body {
    display: grid;
    grid-template-columns: 38% 62%;
    height: calc(297mm - 38mm);
  }
  .left {
    background: #f4f8fa;
    padding: 7mm 7mm;
    display: flex;
    flex-direction: column;
    gap: 5mm;
    border-right: 1px solid #dde8ee;
  }
  .right {
    background: #fff;
    padding: 7mm 8mm;
    display: flex;
    flex-direction: column;
    gap: 5mm;
  }
  .left h2 {
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #0f4c5c;
    border-bottom: 2px solid #5ab4c8;
    padding-bottom: 1.5mm;
    margin-bottom: 2.5mm;
  }
  .right h2 {
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #0f4c5c;
    border-bottom: 1px solid #dde8ee;
    padding-bottom: 1.5mm;
    margin-bottom: 2.5mm;
  }
  .left p, .right p { font-size: 10px; line-height: 1.6; color: #333; margin-bottom: 1.5mm; }
  .skill-tag {
    display: inline-block;
    background: #d8eef4;
    color: #0f4c5c;
    padding: 1mm 3mm;
    border-radius: 2mm;
    font-size: 9px;
    margin: 1mm 1mm 0 0;
  }
  .exp-item { margin-bottom: 4mm; }
  .exp-title { font-size: 11px; font-weight: bold; color: #1a1a1a; }
  .exp-meta { font-size: 9px; color: #5ab4c8; margin-bottom: 1.5mm; }
  .exp-item ul { padding-left: 4mm; }
  .exp-item ul li { font-size: 10px; line-height: 1.5; color: #333; margin-bottom: 1mm; }
  .proj-item { margin-bottom: 3mm; }
  .proj-name { font-size: 11px; font-weight: bold; color: #1a1a1a; }
  .proj-desc { font-size: 10px; color: #444; line-height: 1.5; }
  .proj-tech { font-size: 9px; color: #5ab4c8; margin-top: 1mm; }
  .edu-item { margin-bottom: 3mm; }
  .edu-inst { font-size: 10px; font-weight: bold; color: #1a1a1a; }
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
    <div class="left">
      <div>
        <h2>Skills</h2>
        ${(data.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join("")}
      </div>

      <div>
        <h2>Education</h2>
        ${(data.education || []).map(e => `
          <div class="edu-item">
            <div class="edu-inst">${e.institution}</div>
            <div class="edu-deg">${e.degree}</div>
            <div class="edu-year">${e.year}</div>
          </div>`).join("")}
      </div>

      ${data.languages?.length ? `
      <div>
        <h2>Languages</h2>
        ${data.languages.map(l => `<p>• ${l}</p>`).join("")}
      </div>` : ""}
    </div>

    <div class="right">
      <div>
        <h2>Profile</h2>
        <p>${data.summary || ""}</p>
      </div>

      <div>
        <h2>Experience</h2>
        ${(data.experience || []).map(e => `
          <div class="exp-item">
            <div class="exp-title">${e.role} — ${e.company}</div>
            <div class="exp-meta">${e.duration}</div>
            <ul>${(e.points || []).map(p => `<li>${p}</li>`).join("")}</ul>
          </div>`).join("")}
      </div>

      <div>
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
