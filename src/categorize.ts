import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function categorizeEmail(subject: string, body: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Categorize this email into ONE of these categories: Interested, Meeting Booked, Not Interested, Spam, Out of Office

Subject: ${subject}
Body: ${body}

Respond with ONLY the category name, nothing else.`,
        },
      ],
    });

    const category = message.content[0].type === 'text' ? message.content[0].text.trim() : 'Uncategorized';
    
    // Validate category
    const validCategories = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'];
    return validCategories.includes(category) ? category : 'Uncategorized';
  } catch (error) {
    console.error('Categorization error:', error);
    return 'Uncategorized';
  }
}
