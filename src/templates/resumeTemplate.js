export const defaultTemplate = (data = {}) => `
<html>
  <head>
    <style>
      body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #f5f7fa; }
      .container { display: flex; width: 900px; margin: auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
      .left { width: 35%; background: #1e293b; color: white; padding: 30px; }
      .right { width: 65%; padding: 30px; }
      h1 { margin-bottom: 10px; }
      h2 { margin-top: 20px; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
      h3 { color: #94a3b8; }
      .skill { background: #334155; padding: 5px 10px; margin: 5px 0; border-radius: 5px; font-size: 14px; }
      .section { margin-bottom: 20px; }
      .exp-item { margin-bottom: 15px; }
      .exp-item strong { font-size: 15px; }
      .exp-item span { color: #64748b; font-size: 13px; }
      ul { padding-left: 18px; }
      li { margin-bottom: 4px; font-size: 14px; }
      .project { margin-bottom: 12px; }
      .project strong { color: #1e293b; }
      .tech-tag { display: inline-block; background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin: 2px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="left">
        ${data.photo ? `<img src="${data.photo}" style="width:120px;border-radius:50%;display:block;margin-bottom:15px;"/>` : ""}
        <h1>${data.name || ""}</h1>
        <p style="color:#94a3b8; margin-top:0;">${data.title || ""}</p>
        <div class="section">
          <h3>Skills</h3>
          ${(data.skills || []).map(s => `<div class="skill">${s}</div>`).join("")}
        </div>
        ${data.certifications?.length ? `
        <div class="section">
          <h3>Certifications</h3>
          ${data.certifications.map(c => `<div class="skill">${c}</div>`).join("")}
        </div>` : ""}
        ${data.education ? `
        <div class="section">
          <h3>Education</h3>
          <p style="font-size:14px;">${data.education}</p>
        </div>` : ""}
      </div>
      <div class="right">
        <div class="section">
          <h2>Summary</h2>
          <p>${data.summary || ""}</p>
        </div>
        <div class="section">
          <h2>Experience</h2>
          ${Array.isArray(data.experience)
            ? data.experience.map(e => `
              <div class="exp-item">
                <strong>${e.role || ""}</strong> — <span>${e.company || ""} | ${e.duration || ""}</span>
                <ul>${(e.points || []).map(p => `<li>${p}</li>`).join("")}</ul>
              </div>`).join("")
            : `<p>${data.experience || ""}</p>`}
        </div>
        <div class="section">
          <h2>Projects</h2>
          ${Array.isArray(data.projects)
            ? data.projects.map(p => `
              <div class="project">
                <strong>${p.name || ""}</strong>
                <p style="margin:4px 0; font-size:14px;">${p.description || ""}</p>
                ${(p.tech || []).map(t => `<span class="tech-tag">${t}</span>`).join("")}
              </div>`).join("")
            : `<p>${data.projects || ""}</p>`}
        </div>
      </div>
    </div>
  </body>
</html>`;
