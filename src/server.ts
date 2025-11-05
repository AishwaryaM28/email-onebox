import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { 
  getAllEmails, 
  searchEmails, 
  filterByAccount, 
  filterByCategory 
} from './elasticsearch';
import { syncAndSaveEmails } from './sync-and-save';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ FIX 1: Remove trailing slash from Vercel URL
app.use(cors({
  origin: [
    'https://email-onebox-seven.vercel.app',  // ✅ NO trailing slash
    'http://localhost:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: '📧 Email Onebox API',
    version: '1.0.0',
    endpoints: {
      'GET /api/emails': 'Get all emails',
      'GET /api/emails/search?q=query': 'Search emails',
      'GET /api/emails/account/:account': 'Filter by account',
      'GET /api/emails/category/:category': 'Filter by category',
      'GET /api/stats': 'Get statistics'
    }
  });
});

// ✅ FIX 2: Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all emails
app.get('/api/emails', async (req, res) => {
  try {
    const emails = await getAllEmails();
    res.json({
      success: true,
      count: emails.length,
      emails: emails.map((hit: any) => hit._source)
    });
  } catch (error: any) {
    console.error('❌ Error in /api/emails:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search emails
app.get('/api/emails/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const results = await searchEmails(query);
    res.json({
      success: true,
      query: query,
      count: results.length,
      emails: results.map((hit: any) => hit._source)
    });
  } catch (error: any) {
    console.error('❌ Error in search:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Filter by account
app.get('/api/emails/account/:account', async (req, res) => {
  try {
    const account = req.params.account;
    const results = await filterByAccount(account);
    res.json({
      success: true,
      account: account,
      count: results.length,
      emails: results.map((hit: any) => hit._source)
    });
  } catch (error: any) {
    console.error('❌ Error in account filter:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Filter by category
app.get('/api/emails/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const results = await filterByCategory(category);
    res.json({
      success: true,
      category: category,
      count: results.length,
      emails: results.map((hit: any) => hit._source)
    });
  } catch (error: any) {
    console.error('❌ Error in category filter:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const allEmails = await getAllEmails();
    
    // Count by category
    const categories: any = {};
    const accounts: any = {};
    
    allEmails.forEach((hit: any) => {
      const email = hit._source;
      
      // Count categories
      if (email.category) {
        categories[email.category] = (categories[email.category] || 0) + 1;
      }
      
      // Count accounts
      if (email.account) {
        accounts[email.account] = (accounts[email.account] || 0) + 1;
      }
    });

    res.json({
      success: true,
      statistics: {
        total_emails: allEmails.length,
        categories: categories,
        accounts: accounts
      }
    });
  } catch (error: any) {
    console.error('❌ Error in stats:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ FIX 3: Add sync endpoint
app.get('/api/sync', async (req, res) => {
  try {
    console.log('🔄 Manual sync triggered...');
    await syncAndSaveEmails();
    res.json({
      success: true,
      message: 'Email sync completed successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ FIX 4: Start server and auto-sync on startup
app.listen(PORT, async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   📧 EMAIL ONEBOX API SERVER 📧');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n✅ Server running on: http://localhost:${PORT}`);
  console.log('\n📋 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/emails`);
  console.log(`   GET  http://localhost:${PORT}/api/emails/search?q=query`);
  console.log(`   GET  http://localhost:${PORT}/api/emails/category/Interested`);
  console.log(`   GET  http://localhost:${PORT}/api/stats`);
  console.log(`   GET  http://localhost:${PORT}/api/sync`);
  console.log('\n💡 Test in browser or Postman!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // ✅ Auto-sync on startup
  try {
    console.log('🔄 Starting initial email sync...');
    await syncAndSaveEmails();
    console.log('✅ Initial sync completed!\n');
  } catch (error: any) {
    console.error('❌ Initial sync failed:', error.message);
  }
});
