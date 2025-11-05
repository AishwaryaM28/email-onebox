require('dotenv').config();
const Imap = require('node-imap');

console.log('🚀 Starting email test...');

const imapConfig = {
  user: process.env.GMAIL1,
  password: process.env.GMAIL1_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const imap = new Imap(imapConfig);

imap.once('ready', function() {
  console.log('✅ Connected to Gmail!');
  imap.openBox('INBOX', true, function(err: any, box: any) {
    if (err) throw err;
    console.log(`📬 You have ${box.messages.total} emails in inbox!`);
    imap.end();
  });
});

imap.once('error', function(err: any) {
  console.log('❌ Error:', err);
});

imap.connect();
