# 📧 Email Onebox

**AI-powered email aggregator for ReachInbox Assignment**

---

## What This Does

- Syncs Gmail emails automatically
- Categorizes emails using AI (Spam, Interested, Meeting, etc.)
- Stores emails in Elasticsearch database
- Sends Slack notifications for interested emails
- Beautiful web dashboard to view and search emails

---

## Features Completed

✅ **1. Email Sync** - Connects to Gmail and syncs last 30 emails  
✅ **2. Elasticsearch Storage** - All emails stored and searchable  
✅ **3. AI Categorization** - Auto-tags emails into 5 categories  
✅ **4. Slack Integration** - Sends notifications for interested leads  
✅ **5. Web Dashboard** - Search, filter, and view all emails  
❌ **6. AI Replies** - Not implemented (bonus feature)

**Completion: 5/6 features (83%)**

---

## Quick Start

### 1. Install

git clone https://github.com/AishwaryaM28/email-onebox.git
cd email-onebox
npm install
cd frontend && npm install && cd ..



### 2. Setup Environment

Create `.env` file:

GMAIL1=your-email@gmail.com
GMAIL1_PASSWORD=your-app-password
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
ELASTICSEARCH_NODE=http://localhost:9200



### 3. Start Elasticsearch

docker-compose up -d



### 4. Sync Emails

npx ts-node src/sync-and-save.ts


### 5. Start Backend

npx ts-node src/server.ts


### 6. Start Frontend

cd frontend
npm run dev


**Open:** `http://localhost:3001`

---

## API Endpoints (Test with Postman)

- `GET http://localhost:3000/api/emails` - Get all emails
- `GET http://localhost:3000/api/emails/search?q=meeting` - Search
- `GET http://localhost:3000/api/emails/category/Spam` - Filter by category
- `GET http://localhost:3000/api/stats` - Get statistics

---

## Tech Stack

- **Backend:** Node.js + TypeScript + Express
- **Frontend:** Next.js + Tailwind CSS
- **Database:** Elasticsearch (Docker)
- **Email:** Gmail IMAP
- **Notifications:** Slack Webhooks

---


---

## How AI Categorization Works

The system checks email content for keywords:

- **Spam:** "offer", "discount", "click here"
- **Interested:** "interested", "great", "love"
- **Meeting Booked:** "meeting", "confirmed", "scheduled"
- **Not Interested:** "no thanks", "not interested"
- **Out of Office:** "out of office", "away"
- **Uncategorized:** Everything else

---

## Troubleshooting

**Elasticsearch won't start?**

docker-compose restart


**Can't connect to Gmail?**
- Use App Password (not regular password)
- Enable IMAP in Gmail settings

**Frontend not showing emails?**
- Check backend is running: `http://localhost:3000/health`
- Check Elasticsearch has data: `curl http://localhost:9200/emails/_count`

---

## Demo Video



---

## Author

**Aishwarya M**  
GitHub: [@AishwaryaM28](https://github.com/AishwaryaM28)

Built for ReachInbox Backend Engineering Assignment

---

