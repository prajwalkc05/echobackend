export const template1 = (data = {}) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @page { size: A4; margin: 0; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    background: #e5e5e5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  @media print {
    body { background: #fff; }
    .resume { box-shadow: none; margin: 0; }
  }

  .resume {
    width: 800px;
    min-height: 1130px;
    background: #ffffff;
    margin: 0 auto;
    box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  }

  /* ── HEADER ── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 40px 40px 20px 40px;
    background: #fff;
  }

  .header-left h1 {
    font-size: 34px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    line-height: 1.1;
  }

  .header-left .role {
    font-size: 19px;
    color: #555555;
    font-weight: 400;
    margin-top: 8px;
  }

  .header-right img {
    width: 115px;
    height: 115px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #C4A882;
    display: block;
  }

  .header-right .photo-placeholder {
    width: 115px;
    height: 115px;
    border-radius: 50%;
    background: #d8c3af;
    border: 3px solid #C4A882;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #7A5C3C;
    text-align: center;
  }

  /* ── DIVIDER ── */
  .divider {
    display: flex;
    align-items: center;
    margin: 0 40px;
    height: 8px;
    position: relative;
  }

  .divider-thick {
    width: 100px;
    height: 3px;
    background: #7A5C3C;
    flex-shrink: 0;
  }

  .divider-thin {
    flex: 1;
    height: 2px;
    background: #7A5C3C;
  }

  .divider-square {
    width: 8px;
    height: 8px;
    background: #7A5C3C;
    flex-shrink: 0;
  }

  /* ── ABOUT ── */
  .about {
    padding: 18px 40px;
    background: #fff;
  }

  .about h2 {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .about p {
    font-size: 13px;
    color: #444444;
    line-height: 1.7;
  }

  /* ── BODY ── */
  .body {
    display: flex;
    flex-direction: row;
    gap: 0;
    align-items: stretch;
  }

  /* ── LEFT SIDEBAR ── */
  .left {
    width: 240px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }

  .sidebar-section {
    padding: 18px 20px;
  }

  .sidebar-section.bg1 { background: #EDE5DC; }
  .sidebar-section.bg2 { background: #E5DCD0; }

  .sidebar-section h3 {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .contact-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .contact-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #7A5C3C;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .contact-icon svg {
    width: 11px;
    height: 11px;
    fill: #fff;
  }

  .contact-text {
    font-size: 11.5px;
    color: #333333;
    line-height: 1.4;
    word-break: break-all;
  }

  .edu-item {
    margin-bottom: 16px;
  }

  .edu-item:last-child { margin-bottom: 0; }

  .edu-uni {
    font-size: 11.5px;
    font-weight: 700;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .edu-degree {
    font-size: 11px;
    color: #555555;
    margin-top: 2px;
  }

  .edu-date {
    font-size: 11px;
    color: #777777;
    margin-top: 2px;
  }

  .skill-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 11.5px;
    color: #333333;
  }

  .skill-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #333333;
    flex-shrink: 0;
  }

  .lang-row {
    display: flex;
    gap: 24px;
  }

  .lang-item {
    font-size: 11.5px;
    color: #333333;
  }

  /* ── RIGHT CONTENT ── */
  .right {
    flex: 1;
    background: #ffffff;
    padding: 18px 24px 18px 0;
    position: relative;
  }

  .right-section {
    padding-left: 28px;
    margin-bottom: 20px;
    position: relative;
  }

  .right-section h3 {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  /* Timeline */
  .timeline-wrap {
    position: relative;
    padding-left: 28px;
  }

  .timeline-line {
    position: absolute;
    left: 10px;
    top: 0;
    bottom: 0;
    width: 1.5px;
    background: #7A5C3C;
  }

  .exp-item {
    position: relative;
    margin-bottom: 20px;
  }

  .exp-item:last-child { margin-bottom: 0; }

  .timeline-marker {
    position: absolute;
    left: -22px;
    top: 3px;
    width: 7px;
    height: 7px;
    background: #7A5C3C;
  }

  .exp-company {
    font-size: 12.5px;
    font-weight: 700;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .exp-role {
    font-size: 11.5px;
    color: #555555;
    margin-top: 2px;
  }

  .exp-desc {
    font-size: 11.5px;
    color: #555555;
    line-height: 1.6;
    margin-top: 4px;
  }

  .achievement-name {
    font-size: 12.5px;
    font-weight: 700;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .achievement-sub {
    font-size: 11.5px;
    color: #555555;
    margin-top: 2px;
  }

  .achievement-desc {
    font-size: 11.5px;
    color: #555555;
    line-height: 1.6;
    margin-top: 4px;
  }

  .ref-row {
    display: flex;
    gap: 24px;
  }

  .ref-col { flex: 1; }

  .ref-name {
    font-size: 11.5px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .ref-inst {
    font-size: 11px;
    color: #555555;
    margin-top: 2px;
  }

  .ref-contact-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 5px;
  }

  .ref-icon svg {
    width: 10px;
    height: 10px;
    fill: #7A5C3C;
  }

  .ref-contact-text {
    font-size: 10.5px;
    color: #333333;
  }

</style>
</head>
<body>

<div class="resume">

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      <h1>${data.name || "Your Name"}</h1>
      <div class="role">${data.title || "Your Job Title"}</div>
    </div>
    <div class="header-right">
      ${data.photo
        ? `<img src="${data.photo}" alt="Profile"/>`
        : `<div class="photo-placeholder">Photo</div>`}
    </div>
  </div>

  <!-- DIVIDER 1 -->
  <div class="divider">
    <div class="divider-thick"></div>
    <div class="divider-thin"></div>
    <div class="divider-square"></div>
  </div>

  <!-- ABOUT ME -->
  <div class="about">
    <h2>About Me</h2>
    <p>${data.summary || "A passionate professional with a strong background in delivering high-quality results. Dedicated to continuous learning and growth, with a proven track record of success in dynamic environments."}</p>
  </div>

  <!-- DIVIDER 2 -->
  <div class="divider">
    <div class="divider-thick"></div>
    <div class="divider-thin"></div>
    <div class="divider-square"></div>
  </div>

  <!-- BODY -->
  <div class="body">

    <!-- LEFT SIDEBAR -->
    <div class="left">

      <!-- CONTACT -->
      <div class="sidebar-section bg1">
        <h3>Contact</h3>
        <div class="contact-row">
          <div class="contact-icon">
            <svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
          </div>
          <div class="contact-text">${data.contact?.phone || "+123-456-7890"}</div>
        </div>
        <div class="contact-row">
          <div class="contact-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          </div>
          <div class="contact-text">${data.contact?.location || "123 Anywhere St., Any City"}</div>
        </div>
        <div class="contact-row">
          <div class="contact-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          </div>
          <div class="contact-text">${data.contact?.website || "www.reallygreatsite.com"}</div>
        </div>
        <div class="contact-row">
          <div class="contact-icon">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </div>
          <div class="contact-text">${data.contact?.email || "hello@reallygreatsite.com"}</div>
        </div>
      </div>

      <!-- EDUCATION -->
      <div class="sidebar-section bg2">
        <h3>Education</h3>
        ${(data.education || []).length > 0
          ? data.education.map(e => `
            <div class="edu-item">
              <div class="edu-uni">${e.institution}</div>
              <div class="edu-degree">${e.degree}</div>
              <div class="edu-date">${e.year}</div>
            </div>`).join("")
          : `
            <div class="edu-item">
              <div class="edu-uni">Borcelle University</div>
              <div class="edu-degree">Master of Business Management</div>
              <div class="edu-date">2029 – 2030</div>
            </div>
            <div class="edu-item">
              <div class="edu-uni">Borcelle University</div>
              <div class="edu-degree">Bachelor of Business Management</div>
              <div class="edu-date">2025 – 2029</div>
            </div>
            <div class="edu-item">
              <div class="edu-uni">Borcelle High School</div>
              <div class="edu-degree">High School Diploma</div>
              <div class="edu-date">2021 – 2025</div>
            </div>`}
      </div>

      <!-- SKILLS -->
      <div class="sidebar-section bg1">
        <h3>Skills</h3>
        ${(data.skills || []).length > 0
          ? data.skills.map(s => `
            <div class="skill-item">
              <div class="skill-dot"></div>
              <span>${s}</span>
            </div>`).join("")
          : `
            <div class="skill-item"><div class="skill-dot"></div><span>Visual Imagination</span></div>
            <div class="skill-item"><div class="skill-dot"></div><span>Lorem Design Software</span></div>
            <div class="skill-item"><div class="skill-dot"></div><span>Typography</span></div>
            <div class="skill-item"><div class="skill-dot"></div><span>Communication</span></div>`}
      </div>

      <!-- LANGUAGES -->
      <div class="sidebar-section bg2">
        <h3>Languages</h3>
        <div class="lang-row">
          ${(data.languages || []).length > 0
            ? data.languages.map(l => `<div class="lang-item">${l}</div>`).join("")
            : `<div class="lang-item">Hindi</div><div class="lang-item">English</div>`}
        </div>
      </div>

    </div>

    <!-- RIGHT CONTENT -->
    <div class="right">

      <!-- WORK EXPERIENCE -->
      <div class="right-section">
        <h3>Work Experience</h3>
        <div class="timeline-wrap">
          <div class="timeline-line"></div>
          ${(data.experience || []).length > 0
            ? data.experience.map(e => `
              <div class="exp-item">
                <div class="timeline-marker"></div>
                <div class="exp-company">${e.company}</div>
                <div class="exp-role">${e.role} · ${e.duration}</div>
                <div class="exp-desc">${(e.points || []).join(" · ") || ""}</div>
              </div>`).join("")
            : `
              <div class="exp-item">
                <div class="timeline-marker"></div>
                <div class="exp-company">Borcelle Studio</div>
                <div class="exp-role">Art Director · 2030 – Present</div>
                <div class="exp-desc">Led creative direction for brand campaigns and digital projects.</div>
              </div>
              <div class="exp-item">
                <div class="timeline-marker"></div>
                <div class="exp-company">Fauget Studio</div>
                <div class="exp-role">Graphic Designer · 2027 – 2030</div>
                <div class="exp-desc">Designed visual assets for marketing and product teams.</div>
              </div>
              <div class="exp-item">
                <div class="timeline-marker"></div>
                <div class="exp-company">Gromo Studio</div>
                <div class="exp-role">Junior Designer · 2025 – 2027</div>
                <div class="exp-desc">Assisted senior designers in creating brand identity materials.</div>
              </div>`}
        </div>
      </div>

      <!-- ACHIEVEMENT -->
      <div class="right-section">
        <h3>Achievement</h3>
        ${data.certifications?.length > 0
          ? data.certifications.map(c => `
            <div>
              <div class="achievement-name">${c}</div>
            </div>`).join("")
          : `
            <div class="achievement-name">Best Designer Award</div>
            <div class="achievement-sub">Borcelle Studio · 2032</div>
            <div class="achievement-desc">Recognized for outstanding creative contributions to the brand redesign project.</div>`}
      </div>

      <!-- REFERENCE -->
      <div class="right-section">
        <h3>Reference</h3>
        <div class="ref-row">
          <div class="ref-col">
            <div class="ref-name">Estelle Darcy</div>
            <div class="ref-inst">Wardiere Inc. / CTO</div>
            <div class="ref-contact-row">
              <div class="ref-icon"><svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg></div>
              <div class="ref-contact-text">+123-456-7890</div>
            </div>
            <div class="ref-contact-row">
              <div class="ref-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>
              <div class="ref-contact-text">www.reallygreatsite.com</div>
            </div>
          </div>
          <div class="ref-col">
            <div class="ref-name">John Smith</div>
            <div class="ref-inst">Borcelle Studio / CEO</div>
            <div class="ref-contact-row">
              <div class="ref-icon"><svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg></div>
              <div class="ref-contact-text">+123-456-7890</div>
            </div>
            <div class="ref-contact-row">
              <div class="ref-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>
              <div class="ref-contact-text">www.reallygreatsite.com</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

</body>
</html>
`;
