import * as dotenv from 'dotenv';
dotenv.config();

import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { setupElasticsearch, saveEmail } from './elasticsearch';
import { categorizeEmail } from './ai.service';
import { sendSlackNotification, triggerWebhook } from './notification.service';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('       📧 EMAIL ONEBOX - COMPLETE SYSTEM 📧');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const imapConfig = {
  user: process.env.GMAIL1 || '',
  password: process.env.GMAIL1_PASSWORD || '',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

let processedEmails = new Set<string>();

async function processEmail(parsed: any, account: string) {
  const messageId = parsed.messageId || `msg-${Date.now()}`;
  
  // Skip if already processed
  if (processedEmails.has(messageId)) {
    return;
  }
  processedEmails.add(messageId);

  console.log('\n📧 Processing new email...');
  console.log(`   From: ${parsed.from?.text || 'Unknown'}`);
  console.log(`   Subject: ${parsed.subject || 'No Subject'}`);

  // Step 1: Categorize with AI
  const category = await categorizeEmail(
    parsed.subject || '',
    parsed.text || ''
  );

  // Step 2: Create email object
  const email = {
    messageId: messageId,
    account: account,
    from: parsed.from?.text || 'Unknown',
    to: parsed.to?.text || '',
    subject: parsed.subject || 'No Subject',
    body: parsed.text || '',
    date: parsed.date?.toISOString() || new Date().toISOString(),
    folder: 'INBOX',
    category: category
  };

  // Step 3: Save to Elasticsearch
  await saveEmail(email);

  // Step 4: Send notifications if Interested
  if (category.toLowerCase().includes('interested')) {
    console.log('   🎯 INTERESTED EMAIL DETECTED!');
    await sendSlackNotification(email);
    await triggerWebhook(email);
  }

  console.log('   ✅ Email processed successfully\n');
}

async function startEmailSync() {
  // Setup Elasticsearch
  console.log('📊 Setting up Elasticsearch...');
  await setupElasticsearch();
  console.log('');

  const imap = new Imap(imapConfig);

  imap.once('ready', function() {
    console.log('✅ Connected to Gmail!\n');
    console.log('🔄 Syncing emails and starting real-time monitoring...\n');

    imap.openBox('INBOX', false, function(err: any, box: any) {
      if (err) {
        console.error('❌ Error opening inbox:', err);
        return;
      }

      console.log(`📬 Inbox has ${box.messages.total} total emails`);
      console.log(`🔍 Fetching last 30 days of emails...\n`);

      // Get last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const searchDate = thirtyDaysAgo.toISOString().split('T')[0].replace(/-/g, '/');

      imap.search(['ALL', ['SINCE', searchDate]], function(err: any, results: number[]) {
        if (err) {
          console.error('❌ Search error:', err);
          return;
        }

        if (results && results.length > 0) {
          console.log(`📥 Found ${results.length} recent emails. Processing first 30...\n`);

          const fetch = imap.fetch(results.slice(0, 30), {
            bodies: '',
            struct: true
          });

          fetch.on('message', function(msg: any, seqno: number) {
            msg.on('body', function(stream: any) {
              simpleParser(stream, async (err: any, parsed: any) => {
                if (err) {
                  console.log('❌ Parse error:', err);
                  return;
                }
                await processEmail(parsed, imapConfig.user);
              });
            });
          });

          fetch.once('end', function() {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Initial sync complete!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            console.log('👀 Now monitoring for new emails in real-time...');
            console.log('   (Press Ctrl+C to stop)\n');
          });
        } else {
          console.log('⚠️  No recent emails found\n');
          console.log('👀 Monitoring for new emails...\n');
        }
      });

      // Setup real-time monitoring (IMAP IDLE)
      imap.on('mail', function(numNewMsgs: number) {
        console.log(`\n🔔 ${numNewMsgs} new email(s) arrived!`);
        
        // Fetch the new emails
        imap.search(['UNSEEN'], function(err: any, results: number[]) {
          if (err || !results || results.length === 0) return;

          const fetch = imap.fetch(results, {
            bodies: '',
            struct: true,
            markSeen: false
          });

          fetch.on('message', function(msg: any) {
            msg.on('body', function(stream: any) {
              simpleParser(stream, async (err: any, parsed: any) => {
                if (err) return;
                await processEmail(parsed, imapConfig.user);
              });
            });
          });
        });
      });
    });
  });

  imap.once('error', function(err: any) {
    console.log('❌ Connection error:', err.message);
  });

  imap.once('end', function() {
    console.log('\n👋 Connection closed');
  });

  imap.connect();
}

// Start the application
startEmailSync().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
