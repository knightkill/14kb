import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import os from 'os'
import path from 'path'

const env = {
  ...process.env,
  http_proxy: '',
  https_proxy: '',
  HTTP_PROXY: '',
  HTTPS_PROXY: ''
}

console.log('Running stress test against Docker Swarm load balancer...')
console.log('Target: http://localhost:8080 (3 API replicas)')

const script = path.join('test', 'stress', 'swarm-test.yml')
const out = path.join(os.tmpdir(), 'artillery-swarm-report.json')

try {
  execSync(`npx artillery run ${script} -o ${out}`, {stdio: 'inherit', env})
  
  const data = JSON.parse(readFileSync(out))
  const p90 = data.aggregate.latency?.p90 || 0
  const errors = data.aggregate.errors || {}
  const totalErrors = Object.values(errors).reduce((a, b) => a + b, 0)
  const totalRequests = data.aggregate.requestsCompleted || 1
  const errorRate = totalErrors / totalRequests
  
  console.log('\n=== SWARM STRESS TEST RESULTS ===')
  console.log(`Total Requests: ${totalRequests}`)
  console.log(`P90 Latency: ${p90}ms (target: <300ms)`)
  console.log(`Error Rate: ${(errorRate * 100).toFixed(3)}% (target: <0.5%)`)
  console.log(`Total Errors: ${totalErrors}`)
  
  if (p90 > 300 || errorRate > 0.005) {
    console.error('❌ Swarm stress test thresholds exceeded')
    process.exit(1)
  } else {
    console.log('✅ Swarm stress test passed all thresholds')
  }
} catch (error) {
  console.error('Stress test failed:', error.message)
  process.exit(1)
}