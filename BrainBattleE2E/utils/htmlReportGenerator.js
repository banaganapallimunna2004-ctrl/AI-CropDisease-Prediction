const fs = require('fs');
const path = require('path');

function generateHtmlReport(stats, tests, outputPath) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AgroAI Selenium E2E Test Report</title>
  <style>
    body {
      background-color: #0b0f19;
      color: #f3f4f6;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      border-bottom: 1px solid #1e293b;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #34d399;
      margin: 0 0 10px 0;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .card {
      background-color: #111827;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .card h3 {
      margin: 0 0 10px 0;
      color: #9ca3af;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .card .value {
      font-size: 36px;
      font-weight: bold;
    }
    .value.passed { color: #34d399; }
    .value.failed { color: #f87171; }
    .value.duration { color: #60a5fa; }
    .value.total { color: #a78bfa; }
    .test-list {
      background-color: #111827;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 20px;
      max-height: 600px;
      overflow-y: auto;
    }
    .test-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #1e293b;
    }
    .test-item:last-child {
      border-bottom: none;
    }
    .badge {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge.passed { background-color: rgba(52, 211, 153, 0.2); color: #34d399; }
    .badge.failed { background-color: rgba(248, 113, 113, 0.2); color: #f87171; }
    .error-stack {
      background-color: #1f2937;
      color: #fca5a5;
      padding: 10px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      margin-top: 5px;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🌱 AgroAI Precision Crop Detection</h1>
      <p>Selenium Automation Test execution report - 1,100 assertions</p>
    </header>

    <div class="summary-grid">
      <div class="card">
        <h3>Total Tests</h3>
        <div class="value total">${stats.total}</div>
      </div>
      <div class="card">
        <h3>Passed</h3>
        <div class="value passed">${stats.passed}</div>
      </div>
      <div class="card">
        <h3>Failed</h3>
        <div class="value failed">${stats.failed}</div>
      </div>
      <div class="card">
        <h3>Duration</h3>
        <div class="value duration">${(stats.duration / 1000).toFixed(2)}s</div>
      </div>
    </div>

    <h2>Test Details</h2>
    <div class="test-list">
      ${tests.map(test => `
        <div class="test-item-container">
          <div class="test-item">
            <div>
              <strong style="color: #9ca3af;">[${test.category}]</strong> ${test.title}
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span style="color: #6b7280; font-size: 13px;">${test.duration}ms</span>
              <span class="badge ${test.state}">${test.state.toUpperCase()}</span>
            </div>
          </div>
          ${test.error ? `<div class="error-stack">${test.error}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, html, 'utf8');
}

module.exports = { generateHtmlReport };
