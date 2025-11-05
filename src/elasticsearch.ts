import { Client } from '@elastic/elasticsearch';

const client = new Client({ 
  node: 'http://localhost:9200' 
});

export async function setupElasticsearch() {
  try {
    const indexExists = await client.indices.exists({ index: 'emails' });
    
    if (!indexExists) {
      // @ts-ignore - Elasticsearch typing issue
      await client.indices.create({
        index: 'emails',
        mappings: {
          properties: {
            messageId: { type: 'keyword' },
            account: { type: 'keyword' },
            from: { type: 'text' },
            to: { type: 'text' },
            subject: { type: 'text' },
            body: { type: 'text' },
            date: { type: 'date' },
            folder: { type: 'keyword' },
            category: { type: 'keyword' }
          }
        }
      });
      console.log('✅ Created Elasticsearch index!');
    } else {
      console.log('✅ Elasticsearch index already exists');
    }
    
    // Get current count
    const count = await client.count({ index: 'emails' });
    console.log(`📊 Current emails in database: ${count.count}`);
    
  } catch (error: any) {
    console.error('❌ Elasticsearch setup error:', error.message);
    throw error;
  }
}

export async function saveEmail(email: any) {
  try {
    await client.index({
      index: 'emails',
      id: email.messageId,
      document: email
    });
    console.log(`💾 Saved: ${email.subject?.substring(0, 50)}...`);
  } catch (error: any) {
    console.error('❌ Error saving email:', error.message);
  }
}

export async function searchEmails(query: string) {
  try {
    // @ts-ignore - Elasticsearch typing issue
    const result = await client.search({
      index: 'emails',
      query: {
        multi_match: {
          query: query,
          fields: ['subject', 'body', 'from']
        }
      }
    });
    return result.hits.hits;
  } catch (error: any) {
    console.error('❌ Search error:', error.message);
    return [];
  }
}

export async function getAllEmails() {
  try {
    // @ts-ignore - Elasticsearch typing issue
    const result = await client.search({
      index: 'emails',
      query: { match_all: {} },
      size: 100
    });
    return result.hits.hits;
  } catch (error: any) {
    console.error('❌ Error getting emails:', error.message);
    return [];
  }
}

export async function filterByAccount(account: string) {
  try {
    // @ts-ignore - Elasticsearch typing issue
    const result = await client.search({
      index: 'emails',
      query: {
        term: { account: account }
      }
    });
    return result.hits.hits;
  } catch (error: any) {
    console.error('❌ Filter error:', error.message);
    return [];
  }
}

export async function filterByCategory(category: string) {
  try {
    // @ts-ignore - Elasticsearch typing issue
    const result = await client.search({
      index: 'emails',
      query: {
        term: { category: category }
      }
    });
    return result.hits.hits;
  } catch (error: any) {
    console.error('❌ Filter error:', error.message);
    return [];
  }
}
