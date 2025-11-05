import * as dotenv from 'dotenv';
dotenv.config();

import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { setupElasticsearch, saveEmail } from './elasticsearch';

console.log('🚀 Starting Email Sync with Smart Categorization & Security Filter...\n');

const imapConfig = {
  user: process.env.GMAIL1 || '',
  password: process.env.GMAIL1_PASSWORD || '',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};

interface EmailData {
  messageId: string;
  account: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  folder: string;
  category: string;
}

// ✅ SECURITY: Filter out sensitive emails
function isSensitiveEmail(subject: string, body: string): boolean {
  const text = `${subject} ${body}`.toLowerCase();
  
  const sensitiveKeywords = [
    'verification code',
    'verify your',
    'security alert',
    'app password',
    'recovery email',
    '2-step verification',
    'password reset',
    'sign-in',
    'new sign-in',
    'account recovered',
    'suspicious activity',
    'security code',
    'authenticate',
  ];

  return sensitiveKeywords.some(keyword => text.includes(keyword));
}

function categorizeEmail(subject: string, body: string): string {
  const text = `${subject} ${body}`.toLowerCase();

  // Spam detection
  if (
    text.includes('offer') ||
    text.includes('discount') ||
    text.includes('limited time') ||
    text.includes('click here') ||
    text.includes('unsubscribe')
  ) {
    return 'Spam';
  }

  // Out of Office
  if (text.includes('out of office') || text.includes('away') || text.includes('unavailable')) {
    return 'Out of Office';
  }

  // Meeting Booked
  if (
    text.includes('meeting') ||
    text.includes('confirmed') ||
    text.includes('scheduled') ||
    text.includes('calendar') ||
    text.includes('time slot')
  ) {
    return 'Meeting Booked';
  }

  // Not Interested
  if (
    text.includes('no thanks') ||
    text.includes('not interested') ||
    text.includes('remove') ||
    text.includes('unsubscribe me')
  ) {
    return 'Not Interested';
  }

  // Interested
  if (
    text.includes('interested') ||
    text.includes('great') ||
    text.includes('love') ||
    text.includes('awesome') ||
    text.includes('perfect') ||
    text.includes("let's discuss")
  ) {
    return 'Interested';
  }

  return 'Uncategorized';
}

let emailCount = 0;
let skippedCount = 0;

async function syncEmails(): Promise<void> {
  try {
    console.log('📊 Setting up Elasticsearch...');
    await setupElasticsearch();

    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
      console.log('✅ Connected to Gmail!\n');

      imap.openBox('INBOX', false, (err: any, box: any) => {
        if (err) {
          console.error('❌ Error:', err);
          imap.end();
          return;
        }

        console.log(`📬 Total emails: ${box.messages.total}\n`);

        const start = Math.max(1, box.messages.total - 30);
        const f = imap.fetch(`${start}:${box.messages.total}`, { bodies: '' });

        let processed = 0;
        let completed = 0;

        f.on('message', (msg: any, seqno: number) => {
          processed++;

          msg.on('body', (stream: any) => {
            simpleParser(stream, async (err: any, parsed: any) => {
              if (err) {
                completed++;
                if (completed === processed) finalize();
                return;
              }

              try {
                const subject = parsed.subject || 'No Subject';
                const body = parsed.text || '';

                // ✅ SECURITY CHECK: Skip sensitive emails
                if (isSensitiveEmail(subject, body)) {
                  skippedCount++;
                  console.log(`⚠️ [SKIPPED - SENSITIVE] ${subject.substring(0, 40)}`);
                  completed++;
                  if (completed === processed) finalize();
                  return;
                }

                // Categorize email
                const category = categorizeEmail(subject, body);

                const email: EmailData = {
                  messageId: parsed.messageId || `msg-${Date.now()}-${seqno}`,
                  account: process.env.GMAIL1 || '',
                  from: parsed.from?.text || 'Unknown',
                  to: parsed.to?.text || '',
                  subject: subject,
                  body: body.substring(0, 2000),
                  date: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
                  folder: 'INBOX',
                  category: category,
                };

                emailCount++;

                console.log(`✅ [${emailCount}] ${email.subject.substring(0, 35)}`);
                console.log(`   📂 Category: ${email.category}`);

                await saveEmail(email).catch(() => {});
              } catch (error) {
                console.error(`❌ Error:`, error);
              }

              completed++;
              if (completed === processed) finalize();
            });
          });
        });

        function finalize() {
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`✅ Saved: ${emailCount} safe emails`);
          console.log(`⚠️ Skipped: ${skippedCount} sensitive emails`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          imap.end();
        }
      });
    });

    imap.once('error', (err: any) => {
      console.error('❌ IMAP Error:', err.message);
      process.exit(1);
    });

    imap.once('end', () => {
      console.log('✨ Refresh frontend: http://localhost:3001\n');
      process.exit(0);
    });

    imap.connect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncEmails().catch(console.error);
