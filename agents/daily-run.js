// ============================================================
// daily-run.js — aipickspro.com
// Master orchestrator. Called by Windows Task Scheduler at 09:00.
//
// Pipeline order:
//   07:00 → validation-agent  (score finished matches → pick_won)
//   09:00 → publisher-agent   (push WON/LOST badges to site)
//           stats-agent       (fetch new fixtures + odds)
//           writing-agent     (generate predictions for new fixtures)
//           publisher-agent   (publish new predictions to site)
//
// This script is called at 09:00 and handles steps 2-5.
// validation-agent runs separately at 07:00 (separate scheduled task).
//
// Logs every run to agents/logs/YYYY-MM-DD.log
// Exits 0 on success, 1 on failure.
// ============================================================

const { spawn } = require('child_process');
const fs        = require('fs');
const path      = require('path');

const LOG_DIR = path.join(__dirname, 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

const today   = new Date().toISOString().split('T')[0];
const logFile = path.join(LOG_DIR, `${today}.log`);

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  process.stdout.write(line);
}

function runAgent(name) {
  return new Promise((resolve, reject) => {
    log(`▶ Starting ${name}...`);
    const proc = spawn('node', [name], {
      cwd:   __dirname,
      shell: true,
      env:   process.env,
    });
    proc.stdout.on('data', d => fs.appendFileSync(logFile, d));
    proc.stderr.on('data', d => fs.appendFileSync(logFile, `[ERR] ${d}`));
    proc.on('close', code => {
      if (code === 0) { log(`✓ ${name} OK`); resolve(); }
      else            { log(`✗ ${name} FAILED (exit ${code})`); reject(new Error(name)); }
    });
    proc.on('error', err => {
      log(`✗ ${name} could not start: ${err.message}`);
      reject(err);
    });
  });
}

(async () => {
  const t0 = Date.now();
  log('══════════════════════════════════════════════════');
  log(`  DAILY PIPELINE — ${today}`);
  log('══════════════════════════════════════════════════');

  // Step 1: Push WON/LOST badges from validation-agent (ran at 07:00)
  // Optional — if validation found nothing, publisher just skips quickly
  try {
    await runAgent('publisher-agent.js');
  } catch {
    log('Warning: publisher (badges) failed — continuing');
  }

  // Step 2: Fetch new fixtures + odds (required)
  try {
    await runAgent('stats-agent.js');
  } catch {
    log('FATAL: stats-agent failed — cannot continue without fresh data');
    process.exit(1);
  }

  // Step 3: Write predictions for new matches (required)
  try {
    await runAgent('writing-agent.js');
  } catch {
    log('FATAL: writing-agent failed');
    process.exit(1);
  }

  // Step 4: Publish everything to GitHub → Vercel rebuilds
  try {
    await runAgent('publisher-agent.js');
  } catch {
    log('FATAL: publisher-agent failed');
    process.exit(1);
  }

  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  log('══════════════════════════════════════════════════');
  log(`  PIPELINE COMPLETED in ${mins} min`);
  log('══════════════════════════════════════════════════');
  process.exit(0);
})();
