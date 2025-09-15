const client = require('prom-client');

// Collect default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics();

// Create an HTTP request duration histogram
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

// Create a counter for total HTTP requests (used by Prometheus alert rules)
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

module.exports = app => {
  // Health endpoint for readiness checks
  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

  // Metrics endpoint
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', client.register.contentType);
      res.end(await client.register.metrics());
    } catch (err) {
      res.status(500).end(err.message);
    }
  });

  // Observe durations for all routes
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const diff = Number(end - start) / 1e9; // seconds
      // Best effort route label
      const route = req.route?.path || req.originalUrl?.split('?')[0] || 'unknown';
      const labels = [req.method, route, String(res.statusCode)];
      httpRequestDurationSeconds.labels(...labels).observe(diff);
      httpRequestsTotal.labels(...labels).inc();
    });
    next();
  });
};
