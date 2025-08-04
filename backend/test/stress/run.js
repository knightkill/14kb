import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import os from 'os'
import path from 'path'

const script = path.join('test', 'stress', 'high-concurrency.yml')
const out = path.join(os.tmpdir(), 'artillery-report.json')
execSync(`npx artillery run ${script} -o ${out}`, {stdio: 'inherit'})
const data = JSON.parse(readFileSync(out))
const p90 = data.aggregate.latency?.p90 || 0
const errors = data.aggregate.errors || {}
const totalErrors = Object.values(errors).reduce((a, b) => a + b, 0)
const totalRequests = data.aggregate.requestsCompleted || 1
const errorRate = totalErrors / totalRequests
const cpu = os.loadavg()[0] / os.cpus().length
const mem = process.memoryUsage().rss / os.totalmem()
if (p90 > 200 || errorRate > 0.001 || cpu > 0.7 || mem > 0.7) {
  console.error('stress thresholds exceeded')
  process.exit(1)
}
