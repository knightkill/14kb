import { Router } from 'express'
import os from 'os'

const contacts = []
const router = Router()
const startTime = Date.now()
let requestCount = 0
let errorCount = 0
const responseTimes = []

// Middleware to track metrics
router.use((req, res, next) => {
  requestCount++
  const start = Date.now()
  
  res.on('finish', () => {
    const responseTime = Date.now() - start
    responseTimes.push(responseTime)
    
    // Keep only last 100 response times for performance
    if (responseTimes.length > 100) {
      responseTimes.shift()
    }
    
    if (res.statusCode >= 400) {
      errorCount++
    }
  })
  
  next()
})

router.get('/health', (req, res) => {
  const uptime = Date.now() - startTime
  const cpuUsage = os.loadavg()[0] // 1-minute load average
  const memoryUsage = process.memoryUsage()
  const freeMemory = os.freemem()
  const totalMemory = os.totalmem()
  
  // Calculate response time percentiles
  const sortedTimes = [...responseTimes].sort((a, b) => a - b)
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0
  const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)] || 0
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0
  
  const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0
  
  res.json({
    status: 'ok',
    uptime: Math.round(uptime / 1000), // seconds
    metrics: {
      requests: requestCount,
      errors: errorCount,
      errorRate: parseFloat(errorRate.toFixed(2)),
      responseTime: {
        p50,
        p90,
        p99,
        avg: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0
      },
      system: {
        cpuLoad: parseFloat(cpuUsage.toFixed(2)),
        memoryUsage: {
          used: Math.round((totalMemory - freeMemory) / (1024 * 1024)), // MB
          total: Math.round(totalMemory / (1024 * 1024)), // MB
          percentage: parseFloat(((totalMemory - freeMemory) / totalMemory * 100).toFixed(1))
        },
        processMemory: {
          rss: Math.round(memoryUsage.rss / (1024 * 1024)), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / (1024 * 1024)), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / (1024 * 1024)) // MB
        }
      }
    },
    pid: process.pid,
    nodeVersion: process.version
  })
})

router.post('/contact', (req, res) => {
  contacts.push(req.body)
  res.json({received: true})
})

export { contacts }
export default router
