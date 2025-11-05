import { setupElasticsearch } from './elasticsearch';

console.log('🔧 Testing Elasticsearch connection...\n');

setupElasticsearch()
  .then(() => {
    console.log('\n✅ Elasticsearch is working perfectly!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Elasticsearch test failed:', error.message);
    console.log('\n💡 Make sure Docker Desktop is running!');
    console.log('💡 Run: docker compose up -d');
    process.exit(1);
  });
