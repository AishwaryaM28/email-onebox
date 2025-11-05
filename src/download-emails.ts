import * as dotenv from 'dotenv';
dotenv.config();

import Imap from 'node-imap';
import { simpleParser } from 'mailparser';

console.log('📧 Starting email download...\n');

const imapConfig = {
  user: process.env.GMAIL1 || '',
  password: process.env.GMAIL1_PASSWORD || '',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const imap = new Imap(imapConfig);

function openInbox(cb: any) {
  imap.openBox('INBOX', false, cb);
}

imap.once('ready', function() {
  console.log('✅ Connected to Gmail!\n');
  
  openInbox(function(err: any, box: any) {
    if (err) throw err;
    
    console.log(`📬 Total emails in inbox: ${box.messages.total}\n`);
    
    // Get emails from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const searchDate = thirtyDaysAgo.toISOString().split('T')[0].replace(/-/g, '/');
    
    console.log(`🔍 Searching emails since: ${searchDate}\n`);
    
    imap.search(['ALL', ['SINCE', searchDate]], function(err: any, results: number[]) {
      if (err) throw err;
      
      if (!results || results.length === 0) {
        console.log('❌ No emails found in last 30 days');
        imap.end();
        return;
      }
      
      console.log(`📥 Found ${results.length} emails. Downloading first 10...\n`);
      
      // Download only first 10 emails for now
      const emailsToFetch = results.slice(0, 10);
      
      const fetch = imap.fetch(emailsToFetch, {
        bodies: '',
        struct: true
      });
      
      let emailCount = 0;
      
      fetch.on('message', function(msg: any, seqno: number) {
        msg.on('body', function(stream: any) {
          simpleParser(stream, async (err: any, parsed: any) => {
            if (err) {
              console.log('❌ Error parsing email:', err);
              return;
            }
            
            emailCount++;
            
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📧 Email #${emailCount}`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`From: ${parsed.from?.text || 'Unknown'}`);
            console.log(`To: ${parsed.to?.text || 'Unknown'}`);
            console.log(`Subject: ${parsed.subject || 'No Subject'}`);
            console.log(`Date: ${parsed.date}`);
            console.log(`Body Preview: ${parsed.text?.substring(0, 100)}...`);
            console.log(`\n`);
          });
        });
      });
      
      fetch.once('error', function(err: any) {
        console.log('❌ Fetch error: ' + err);
      });
      
      fetch.once('end', function() {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Finished downloading emails!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        imap.end();
      });
    });
  });
});

imap.once('error', function(err: any) {
  console.log('❌ Connection error:', err);
});

imap.once('end', function() {
  console.log('\n👋 Connection closed');
});

imap.connect();
