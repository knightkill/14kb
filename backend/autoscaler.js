import { execSync } from 'child_process'

class AutoScaler {
  constructor() {
    this.services = {
      'api-backend': {
        name: '14kb_api-backend',
        minReplicas: 1,
        maxReplicas: 10,
        currentReplicas: 3,
        healthUrl: 'http://localhost:8080/health'
      },
      'web-ui': {
        name: '14kb_web-ui', 
        minReplicas: 1,
        maxReplicas: 5,
        currentReplicas: 2
      }
    }
    
    this.metrics = {
      responseTime: [],
      cpuUsage: [],
      memoryUsage: [],
      errorRate: 0
    }
    
    this.cooldowns = {
      lastScaleUp: 0,
      lastScaleDown: 0
    }
    
    this.SCALE_UP_COOLDOWN = 60 * 1000    // 60 seconds
    this.SCALE_DOWN_COOLDOWN = 180 * 1000  // 3 minutes
    
    this.thresholds = {
      cpu: { high: 70, low: 30 },
      memory: { high: 80, low: 40 },
      responseTime: { high: 100, low: 50 }, // milliseconds
      errorRate: { high: 1 } // 1%
    }
  }

  log(message) {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${message}`)
  }

  async getCurrentReplicas(serviceName) {
    try {
      const result = execSync(`docker service inspect ${serviceName} --format '{{.Spec.Mode.Replicated.Replicas}}'`, 
        { encoding: 'utf-8' })
      return parseInt(result.trim())
    } catch (error) {
      this.log(`Error getting replicas for ${serviceName}: ${error.message}`)
      return 0
    }
  }

  async getServiceStats(serviceName) {
    try {
      // Get container stats for the service
      const containers = execSync(`docker ps -q --filter "label=com.docker.swarm.service.name=${serviceName}"`,
        { encoding: 'utf-8' }).trim().split('\n').filter(id => id)
      
      if (containers.length === 0) return { cpu: 0, memory: 0 }
      
      let totalCpu = 0, totalMemory = 0
      
      for (const containerId of containers) {
        try {
          const stats = execSync(`docker stats ${containerId} --no-stream --format "{{.CPUPerc}},{{.MemPerc}}"`,
            { encoding: 'utf-8' }).trim()
          const [cpu, memory] = stats.split(',').map(s => parseFloat(s.replace('%', '')))
          totalCpu += cpu
          totalMemory += memory
        } catch (err) {
          // Skip container if stats fail
        }
      }
      
      return {
        cpu: totalCpu / containers.length,
        memory: totalMemory / containers.length
      }
    } catch (error) {
      return { cpu: 0, memory: 0 }
    }
  }

  async checkHealth(url) {
    try {
      // Use curl instead of fetch to avoid dependency
      const result = execSync(`curl -s -w "%{http_code},%{time_total}" -o /dev/null "${url}"`, 
        { encoding: 'utf-8', timeout: 5000 })
      const [httpCode, totalTime] = result.trim().split(',')
      const responseTime = Math.round(parseFloat(totalTime) * 1000)
      
      return { 
        responseTime: responseTime, 
        healthy: httpCode === '200' 
      }
    } catch (error) {
      return { responseTime: 5000, healthy: false }
    }
  }

  shouldScaleUp(service, stats, health) {
    const now = Date.now()
    if (now - this.cooldowns.lastScaleUp < this.SCALE_UP_COOLDOWN) {
      return false
    }
    
    if (service.currentReplicas >= service.maxReplicas) {
      return false
    }
    
    // Scale up conditions
    const highCpu = stats.cpu > this.thresholds.cpu.high
    const highMemory = stats.memory > this.thresholds.memory.high
    const highResponseTime = health && health.responseTime > this.thresholds.responseTime.high
    const unhealthy = health && !health.healthy
    
    return highCpu || highMemory || highResponseTime || unhealthy
  }

  shouldScaleDown(service, stats, health) {
    const now = Date.now()
    if (now - this.cooldowns.lastScaleDown < this.SCALE_DOWN_COOLDOWN) {
      return false
    }
    
    if (service.currentReplicas <= service.minReplicas) {
      return false
    }
    
    // Scale down conditions (all must be true)
    const lowCpu = stats.cpu < this.thresholds.cpu.low
    const lowMemory = stats.memory < this.thresholds.memory.low
    const lowResponseTime = !health || health.responseTime < this.thresholds.responseTime.low
    const healthy = !health || health.healthy
    
    return lowCpu && lowMemory && lowResponseTime && healthy
  }

  async scaleService(serviceName, newReplicas) {
    try {
      this.log(`Scaling ${serviceName} to ${newReplicas} replicas`)
      execSync(`docker service scale ${serviceName}=${newReplicas}`, { stdio: 'pipe' })
      return true
    } catch (error) {
      this.log(`Failed to scale ${serviceName}: ${error.message}`)
      return false
    }
  }

  async monitorAndScale() {
    this.log('🔍 Monitoring services for auto-scaling...')
    
    for (const [key, service] of Object.entries(this.services)) {
      // Update current replica count
      service.currentReplicas = await this.getCurrentReplicas(service.name)
      
      // Get resource stats
      const stats = await this.getServiceStats(service.name)
      
      // Get health check (only for API service)
      let health = null
      if (service.healthUrl) {
        health = await this.checkHealth(service.healthUrl)
      }
      
      // Log current status
      this.log(`📊 ${key}: ${service.currentReplicas} replicas, CPU: ${stats.cpu.toFixed(1)}%, Memory: ${stats.memory.toFixed(1)}%` + 
        (health ? `, Response: ${health.responseTime}ms, Healthy: ${health.healthy}` : ''))
      
      // Check scaling conditions
      if (this.shouldScaleUp(service, stats, health)) {
        const newReplicas = Math.min(service.currentReplicas + 1, service.maxReplicas)
        if (await this.scaleService(service.name, newReplicas)) {
          service.currentReplicas = newReplicas
          this.cooldowns.lastScaleUp = Date.now()
          this.log(`⬆️ Scaled UP ${key} to ${newReplicas} replicas`)
        }
      } else if (this.shouldScaleDown(service, stats, health)) {
        const newReplicas = Math.max(service.currentReplicas - 1, service.minReplicas)
        if (await this.scaleService(service.name, newReplicas)) {
          service.currentReplicas = newReplicas
          this.cooldowns.lastScaleDown = Date.now()
          this.log(`⬇️ Scaled DOWN ${key} to ${newReplicas} replicas`)
        }
      }
    }
  }

  async start() {
    this.log('🚀 Auto-scaler starting...')
    this.log(`Thresholds: CPU ${this.thresholds.cpu.high}%↑/${this.thresholds.cpu.low}%↓, ` +
             `Memory ${this.thresholds.memory.high}%↑/${this.thresholds.memory.low}%↓, ` +
             `Response ${this.thresholds.responseTime.high}ms↑/${this.thresholds.responseTime.low}ms↓`)
    
    // Monitor every 30 seconds
    setInterval(() => {
      this.monitorAndScale().catch(err => {
        this.log(`Error in monitoring cycle: ${err.message}`)
      })
    }, 30000)
    
    // Run initial check
    await this.monitorAndScale()
  }
}

// Start the auto-scaler
const autoscaler = new AutoScaler()
autoscaler.start().catch(console.error)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Auto-scaler shutting down...')
  process.exit(0)
})