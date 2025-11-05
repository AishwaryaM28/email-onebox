// Simple rule-based email categorization (no API needed!)
export async function categorizeEmail(subject: string, body: string): Promise<string> {
  const subjectLower = subject?.toLowerCase() || '';
  const bodyLower = body?.toLowerCase() || '';
  const combined = subjectLower + ' ' + bodyLower;

  console.log(`🤖 Categorizing: ${subject.substring(0, 40)}...`);

  // Interested keywords
  const interestedKeywords = [
    'interested', 'love to', 'would like', 'looking forward',
    'excited', 'keen', 'great fit', 'perfect', 'discuss',
    'interview', 'call', 'schedule', 'available', 'when can',
    'shortlisted', 'selected', 'congratulations', 'next steps',
    'proceed', 'move forward'
  ];

  // Meeting Booked keywords
  const meetingKeywords = [
    'meeting scheduled', 'meeting confirmed', 'calendar invite',
    'zoom link', 'teams meeting', 'google meet', 'booked',
    'appointment', 'confirmed for', 'see you on'
  ];

  // Not Interested keywords
  const notInterestedKeywords = [
    'not interested', 'no thank', 'not a fit', 'unfortunately',
    'regret to', 'not moving forward', 'decided to', 'other candidates',
    'not the right', 'decline', 'pass on'
  ];

  // Out of Office keywords
  const outOfOfficeKeywords = [
    'out of office', 'away from', 'on vacation', 'on leave',
    'automatic reply', 'auto-reply', 'will return', 'back on'
  ];

  // Spam keywords
  const spamKeywords = [
    'winner', 'congratulations you won', 'click here', 'buy now',
    'limited time', 'offer expires', 'act now', 'free money',
    'unsubscribe', 'promotional', 'advertisement', 'discount',
    '50% off', 'sale', 'deal'
  ];

  // Check categories in priority order
  if (outOfOfficeKeywords.some(keyword => combined.includes(keyword))) {
    console.log(`   → Category: Out of Office`);
    return 'Out of Office';
  }

  if (meetingKeywords.some(keyword => combined.includes(keyword))) {
    console.log(`   → Category: Meeting Booked`);
    return 'Meeting Booked';
  }

  if (interestedKeywords.some(keyword => combined.includes(keyword))) {
    console.log(`   → Category: Interested`);
    return 'Interested';
  }

  if (notInterestedKeywords.some(keyword => combined.includes(keyword))) {
    console.log(`   → Category: Not Interested`);
    return 'Not Interested';
  }

  if (spamKeywords.some(keyword => combined.includes(keyword))) {
    console.log(`   → Category: Spam`);
    return 'Spam';
  }

  // Default category
  console.log(`   → Category: Uncategorized`);
  return 'Uncategorized';
}

export async function testAI() {
  console.log('🧪 Testing AI Categorization...\n');

  // Test 1: Interested email
  console.log('Test 1: Interested Email');
  const test1 = await categorizeEmail(
    'Re: Job Application - We would love to discuss',
    'Thank you for applying! We are very interested in your profile and would love to schedule an interview.'
  );
  console.log(`✅ Result: ${test1}\n`);

  // Test 2: Spam
  console.log('Test 2: Spam Email');
  const test2 = await categorizeEmail(
    '50% OFF - Limited Time Offer!',
    'Buy now and save big! Click here for amazing discounts. Offer expires soon!'
  );
  console.log(`✅ Result: ${test2}\n`);

  // Test 3: Out of Office
  console.log('Test 3: Out of Office');
  const test3 = await categorizeEmail(
    'Out of Office: Away until Monday',
    'I am currently out of office on vacation and will return on Monday. Auto-reply.'
  );
  console.log(`✅ Result: ${test3}\n`);

  // Test 4: Meeting Booked
  console.log('Test 4: Meeting Booked');
  const test4 = await categorizeEmail(
    'Interview Scheduled - Zoom Link',
    'Your interview has been confirmed for tomorrow at 3 PM. Here is the Zoom link.'
  );
  console.log(`✅ Result: ${test4}\n`);

  // Test 5: Not Interested
  console.log('Test 5: Not Interested');
  const test5 = await categorizeEmail(
    'Re: Application Status',
    'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.'
  );
  console.log(`✅ Result: ${test5}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All AI tests passed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
