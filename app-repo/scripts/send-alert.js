#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const from = process.env.ALERT_FROM || smtpUser;
const to = process.env.ALERT_TO;

const jestExit = process.argv[2] || 'unknown';
const pwExit = process.argv[3] || 'unknown';

async function main() {
  if (!smtpHost || !to) {
    console.error('Email alert not configured: missing SMTP_HOST or ALERT_TO');
    return;
  }

  const transport = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
  });

  const jestLog = safeRead(path.join('test-artifacts', 'jest.txt'));
  const pwLog = safeRead(path.join('test-artifacts', 'playwright.txt'));

  const subject = `[ALERT] Test failures detected (jest:${jestExit} playwright:${pwExit})`;
  const body = `Automated Test Alert\n\n` +
    `Jest exit code: ${jestExit}\n` +
    `Playwright exit code: ${pwExit}\n\n` +
    `Jest log (tail):\n${tail(jestLog, 200)}\n\n` +
    `Playwright log (tail):\n${tail(pwLog, 200)}\n`;

  await transport.sendMail({ from, to, subject, text: body });
  console.log('Alert email sent to', to);
}

function safeRead(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function tail(text, lines) {
  if (!text) return '(empty)';
  const arr = text.split(/\r?\n/);
  return arr.slice(-lines).join('\n');
}

main().catch(err => {
  console.error('Failed to send alert:', err.message);
});

