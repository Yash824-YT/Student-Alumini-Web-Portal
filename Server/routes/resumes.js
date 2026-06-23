const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { auth } = require('../middleware/auth');

// @route   POST /api/resumes
// @desc    Create or update resume
router.post('/', auth, async (req, res) => {
  try {
    let resume = await Resume.findOne({ userId: req.user._id });

    if (resume) {
      // Update existing resume
      resume = await Resume.findOneAndUpdate(
        { userId: req.user._id },
        { $set: req.body },
        { new: true }
      );
    } else {
      // Create new resume
      resume = new Resume({
        userId: req.user._id,
        ...req.body
      });
      await resume.save();
    }

    res.json(resume);
  } catch (error) {
    console.error('Resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resumes/:userId
// @desc    Get user's resume
router.get('/:userId', async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.params.userId })
      .populate('userId', 'name email');
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resumes/:userId/download
// @desc    Download resume as HTML
router.get('/:userId/download', async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.params.userId })
      .populate('userId', 'name email');
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const html = generateResumeHTML(resume);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="resume-${resume.personalInfo.fullName || 'download'}.html"`);
    res.send(html);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


function generateResumeHTML(resume) {
  const { personalInfo, education, experience, skills, projects, certifications } = resume;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo.fullName || 'Resume'}</title>

<style>
  *{
    margin:0;
    padding:0;
    box-sizing:border-box;
  }

  @page{
    size:A4 portrait;
    margin:12mm;
  }

  body{
    font-family:"Times New Roman", Times, serif;
    font-size:13px;              /* Increased by 1px */
    line-height:1.3;             /* Proper line spacing */
    color:#333;
    max-width:210mm;
    margin:0 auto;
    padding:12px 18px;
  }

  h1{
    font-size:26px;              /* Increased */
    font-weight:bold;
    text-align:center;
    margin-bottom:8px;
    padding-bottom:4px;
    color:#1a1a2e;
  }

  h2{
    font-size:16px;              /* Increased */
    font-weight:bold;
    text-transform:uppercase;
    border-bottom:1px solid #0f3460;
    padding-bottom:3px;
    margin-top:12px;             /* Equal spacing between sections */
    margin-bottom:6px;
    color:#16213e;
  }

  h3{
    font-size:14px;              /* Increased */
    font-weight:bold;
    margin-bottom:2px;
    color:#1a1a2e;
  }

  .contact{
    text-align:center;
    font-size:13px;
    margin-bottom:8px;
    line-height:1.2;
  }

  .contact span{
    margin-right:12px;
  }

  .summary{
    font-size:13px;
    text-align:justify;
    line-height:1.25;
    margin-bottom:8px;
  }

  .item{
    margin-bottom:6px;
  }

  .item-header{
    display:flex;
    justify-content:space-between;
    align-items:baseline;
  }

  .item-date{
    font-size:12px;
    font-style:italic;
    font-weight:bold;
    white-space:nowrap;
  }

  .item-desc{
    font-size:13px;
    line-height:1.25;
    margin-top:2px;
    text-align:justify;
  }

  .skills-list{
    display:flex;
    flex-wrap:wrap;
    gap:4px;
  }

  .skill-tag{
    font-size:12px;
    font-weight:bold;
    padding:2px 8px;
    border-radius:10px;
  }

  /* Equal spacing between all main sections */
  h2 + .item,
  h2 + .skills-list{
    margin-top:4px;
  }

  @media print{
    body{
      padding:6px;
    }

    h1{
      font-size:24px;
    }

    h2{
      margin-top:10px;
      margin-bottom:5px;
    }

    .item{
      margin-bottom:5px;
    }
  }
</style>

</head>

<body>

  <h1 style="text-align:center; padding:4px 0 6px 0;">${personalInfo.fullName || ''}</h1>

  <div class="contact">
    ${personalInfo.email ? `<span>📧 ${personalInfo.email}</span>` : ''}
    ${personalInfo.phone ? `<span>📱 ${personalInfo.phone}</span>` : ''}
    ${personalInfo.address ? `<span>📍 ${personalInfo.address}</span>` : ''}
    ${personalInfo.linkedIn ? `<span>🔗 ${personalInfo.linkedIn}</span>` : ''}
  </div>

  ${personalInfo.summary ? `
    <p class="summary">${personalInfo.summary}</p>
  ` : ''}

  ${education && education.length > 0 ? `
    <h2>Education</h2>

    ${education.map(edu => `
      <div class="item">
        <div class="item-header">
          <h3>
            ${edu.degree}
            ${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
          </h3>

          <span class="item-date">
            ${edu.startYear || ''} - ${edu.endYear || 'Present'}
          </span>
        </div>

        <p class="item-desc">
          ${edu.institution}
          ${edu.grade ? ` | Grade: ${edu.grade}` : ''}
        </p>
      </div>
    `).join('')}
  ` : ''}

  ${experience && experience.length > 0 ? `
    <h2>Experience</h2>

    ${experience.map(exp => `
      <div class="item">
        <div class="item-header">
          <h3>${exp.position} at ${exp.company}</h3>

          <span class="item-date">
            ${exp.startDate || ''} -
            ${exp.isCurrent ? 'Present' : exp.endDate || ''}
          </span>
        </div>

        ${exp.description ? `
          <p class="item-desc">${exp.description}</p>
        ` : ''}
      </div>
    `).join('')}
  ` : ''}

  ${skills && skills.length > 0 ? `
    <h2>Skills</h2>

    <div class="skills-list">
      ${skills.map(skill => `
        <span class="skill-tag">${skill}</span>
      `).join('')}
    </div>
  ` : ''}

  ${projects && projects.length > 0 ? `
    <h2>Projects</h2>

    ${projects.map(proj => `
      <div class="item">

        <h3>
          ${proj.name}

          ${proj.link ? `
            <a href="${proj.link}" style="font-size:13px;">
              ↗
            </a>
          ` : ''}
        </h3>

        ${proj.description ? `
          <p class="item-desc">${proj.description}</p>
        ` : ''}

        ${proj.technologies ? `
          <p class="item-desc">
            <strong>Tech:</strong> ${proj.technologies}
          </p>
        ` : ''}
      </div>
    `).join('')}
  ` : ''}

  ${certifications && certifications.length > 0 ? `
    <h2>Certifications</h2>

    ${certifications.map(cert => `
      <div class="item">
        <h3>${cert.name}</h3>

        <p class="item-desc">
          ${cert.issuer}
          ${cert.year ? ` (${cert.year})` : ''}
        </p>
      </div>
    `).join('')}
  ` : ''}

</body>
</html>`;
}

module.exports = router;
