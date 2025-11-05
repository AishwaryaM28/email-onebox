import { IncomingWebhook } from '@slack/webhook';
import axios from 'axios';

export async function sendSlackNotification(email: any) {
  try {
    if (!process.env.SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL.includes('your-webhook')) {
      console.log('⚠️  Slack webhook not configured - skipping Slack notification');
      return;
    }

    const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);
    
    await webhook.send({
      text: `🎯 New Interested Email Received!`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎯 New Interested Lead!'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*From:*\n${email.from}`
            },
            {
              type: 'mrkdwn',
              text: `*Date:*\n${new Date(email.date).toLocaleString()}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Subject:*\n${email.subject}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Preview:*\n${email.body.substring(0, 200)}...`
          }
        }
      ]
    });
    
    console.log('📱 Slack notification sent!');
  } catch (error: any) {
    console.error('❌ Slack error:', error.message);
  }
}

export async function triggerWebhook(email: any) {
  try {
    if (!process.env.WEBHOOK_URL || process.env.WEBHOOK_URL.includes('your-unique')) {
      console.log('⚠️  Webhook.site URL not configured - skipping webhook');
      return;
    }

    const payload = {
      event: 'interested_email',
      timestamp: new Date().toISOString(),
      email: {
        from: email.from,
        subject: email.subject,
        date: email.date,
        category: email.category,
        bodyPreview: email.body.substring(0, 200)
      }
    };

    await axios.post(process.env.WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔔 Webhook triggered successfully!');
  } catch (error: any) {
    console.error('❌ Webhook error:', error.message);
  }
}

export async function testNotifications() {
  console.log('🧪 Testing Notifications...\n');

  const testEmail = {
    from: 'recruiter@company.com',
    subject: 'Re: Software Engineer Position - Interview Request',
    body: 'We are very interested in your application and would like to schedule an interview with you. Please let us know your availability.',
    date: new Date().toISOString(),
    category: 'Interested'
  };

  console.log('📧 Test Email:');
  console.log(`   From: ${testEmail.from}`);
  console.log(`   Subject: ${testEmail.subject}`);
  console.log(`   Category: ${testEmail.category}\n`);

  console.log('📱 Sending Slack notification...');
  await sendSlackNotification(testEmail);

  console.log('\n🔔 Triggering webhook...');
  await triggerWebhook(testEmail);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Notification tests complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 Check:');
  console.log('   1. Your Slack channel for the message');
  console.log('   2. Webhook.site browser tab for the webhook');
}
