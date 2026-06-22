const autocannon = require('autocannon');

async function runLoadTest() {
  console.log('🚀 Starting Baseline Load Test...');
  console.log('• Connections (Virtual Users): 100');
  console.log('• Duration: 60 seconds');
  console.log('• Target URL: http://localhost:5000/api/health\n');

  const instance = autocannon({
    url: 'http://localhost:5000/api/health',
    connections: 100,
    duration: 60,
    headers: {
      'content-type': 'application/json'
    }
  }, (err, result) => {
    if (err) {
      console.error('❌ Error during load test:', err);
      process.exit(1);
    }
    
    console.log('\n📊 ─── LOAD TEST RESULTS ───');
    console.log(`• Total Duration: ${result.duration}s`);
    console.log(`• Total Requests Sent: ${result.requests.sent}`);
    console.log(`• Requests Per Second (RPS): ${result.requests.average.toFixed(1)} req/sec`);
    console.log(`• Average Response Time: ${result.latency.average} ms`);
    console.log(`• Minimum Response Time: ${result.latency.min} ms`);
    console.log(`• Maximum Response Time: ${result.latency.max} ms`);
    console.log(`• Total Bytes Received: ${(result.throughput.total / 1024 / 1024).toFixed(2)} MB`);
    console.log('───────────────────────────\n');
  });

  // Track progress
  autocannon.track(instance, { render: true });
}

runLoadTest();
