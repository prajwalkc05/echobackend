export const template3 = (data = {}) => `
<html>
<head>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 210mm;
    height: 297mm;
    font-family: 'Georgia', serif;
    font-size: 11px;
    color: #222;
    background: #fff;
    padding: 12mm 14mm;
    overflow: hidden;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 5mm;
    border-bottom: 2px solid #222;
    margin-bottom: 6mm;
  }
  .header-left h1 {
    font-size: 30px;
    font-weight: bold;
    letter-spacing: 1px;
    line-height: 1.1;
  }
  .header-left .title {
    font-size: 11px;
    color: #666;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 2mm;
  }
  .header-right {
    text-align: right;
    font-size: 10px;
    color: #555;
    line-height: 1.7;
  }
  .photo { width: 22mm; height: 22mm; border-radius: 50%; object-fit: cover; margin-left: 5mm; }
  .body { display: grid; grid-template-columns: 62% 35%; gap: 8mm; }
  .section { margin-bottom: 5mm; }
  .section h2 {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #444;
    margin-bottom: 2mm;
    padding-bottom: 1.5mm;
    border-bottom: 1px solid #ddd;
  }
  .section p { font-size: 10px; line-height: 1.6; color: #333; }
  .exp-item { margin-bottom: 4mm; }
  .exp-row { display: flex; justify-content: space-between; align-items: baseline; }
  .exp-title { font-size: 11px; font-weight: bold; }
  .exp-date { font-size: 9px; color: #888; }
  .exp-company { font-size: 10px; color: #666; font-style: italic; margin-bottom: 1.5mm; }
  .exp-item ul { padding-left: 4mm; }
  .exp-item ul li { font-size: 10px; line-height: 1.5; color: #333; margin-bottom: 1mm; }
  .proj-item { margin-bottom: 3mm; }
  .proj-name { font-size: 11px; font-weight: bold; }
  .proj-desc { font-size: 10px; color: #444; line-height: 1.5; }
  .proj-tech { font-size: 9px; color: #888; font-style: italic; margin-top: 1mm; }
  .skill-item {
    font-size: 10px;
    color: #333;
    padding: 1mm 0;
    border-bottom: 1px dotted #ddd;
    line-height: 1.4;
  }
  .edu-item { margin-bottom: 3mm; }
  .edu-inst { font-size: 10px; font-weight: bold; }
  .edu-deg { font-size: 10px; color: #555; }
  .edu-year { font-size: 9px; color: #888; }
</style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>${data.name || ""}</h1>
      <div class="title">${data.title || ""}</div>
    </div>
    <div style="display:flex;align-items:center;">
      <div class="header-right">
        ${data.contact?.email ? `<div>✉ ${data.contact.email}</div>` : ""}
        ${data.contact?.phone ? `<div>✆ ${data.contact.phone}</div>` : ""}
        ${data.contact?.location ? `<div>⌖ ${data.contact.location}</div>` : ""}
        ${data.contact?.website ? `<div>${data.contact.website}</div>` : ""}
      </div>
      ${data.photo ? `<img src="${data.photo}" class="photo"/>` : ""}
    </div>
  </div>

  <div class="body">
    <div class="main">
      <div class="section">
        <h2>Profile</h2>
        <p>${data.summary || ""}</p>
      </div>

      <div class="section">
        <h2>Experience</h2>
        ${(data.experience || []).map(e => `
          <div class="exp-item">
            <div class="exp-row">
              <div class="exp-title">${e.role}</div>
              <div class="exp-date">${e.duration}</div>
            </div>
            <div class="exp-company">${e.company}</div>
            <ul>${(e.points || []).map(p => `<li>${p}</li>`).join("")}</ul>
          </div>`).join("")}
      </div>

      <div class="section">
        <h2>Projects</h2>
        ${(data.projects || []).map(p => `
          <div class="proj-item">
            <div class="proj-name">${p.name}</div>
            <div class="proj-desc">${p.description}</div>
            <div class="proj-tech">${(p.tech || []).join(", ")}</div>
          </div>`).join("")}
      </div>
    </div>

    <div class="sidebar">
      <div class="section">
        <h2>Skills</h2>
        ${(data.skills || []).map(s => `<div class="skill-item">${s}</div>`).join("")}
      </div>

      <div class="section">
        <h2>Education</h2>
        ${(data.education || []).map(e => `
          <div class="edu-item">
            <div class="edu-inst">${e.institution}</div>
            <div class="edu-deg">${e.degree}</div>
            <div class="edu-year">${e.year}</div>
          </div>`).join("")}
      </div>

      ${data.languages?.length ? `
      <div class="section">
        <h2>Languages</h2>
        ${data.languages.map(l => `<div class="skill-item">${l}</div>`).join("")}
      </div>` : ""}
    </div>
  </div>
</body>
</html>`;
