const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, 'public');

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
let requestCount = 0;
const requestLogs = [];

app.use((req, res, next) => {
  requestCount++;
  const logEntry = {
    id: requestCount,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    ip: req.ip || '127.0.0.1'
  };
  requestLogs.unshift(logEntry);
  if (requestLogs.length > 50) requestLogs.pop();
  console.log(`[${logEntry.timestamp}] ${req.method} ${req.url}`);
  next();
});

// Serve static assets
app.use(express.static(publicDirectory));

// Memory storage for contact submissions
const contactSubmissions = [];

// Explicit Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'index.html'));
});

app.get('/navigation', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'navigation.html'));
});

app.get('/route-overview', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'routes-overview.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'about.html'));
});

app.get('/request-flow', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'request-flow.html'));
});

app.get('/available-routes', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'available-routes.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(publicDirectory, 'contact.html'));
});

// API Endpoints
app.get('/api/server-info', (req, res) => {
  res.json({
    status: 'online',
    serverTime: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsageMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
    totalRequestsHandled: requestCount
  });
});

app.get('/api/routes', (req, res) => {
  res.json([
    { figure: 'Fig 4.4', path: '/navigation', name: 'Route Navigation', method: 'GET', description: 'Web Server Route Navigation Section' },
    { figure: 'Fig 4.5', path: '/route-overview', name: 'Route Overview', method: 'GET', description: 'Web Server Route Overview Dashboard' },
    { figure: 'Fig 4.6', path: '/about', name: 'About Page', method: 'GET', description: 'About Page of the Node.js Web Server' },
    { figure: 'Fig 4.7', path: '/request-flow', name: 'Request Flow', method: 'GET', description: 'Request Flow and Server Working Process' },
    { figure: 'Fig 4.8', path: '/available-routes', name: 'Available Routes', method: 'GET', description: 'Available Routes and Page Navigation Hub' },
    { figure: 'Fig 4.9', path: '/404-test', name: 'Custom 404 Error Page', method: 'GET', description: 'Custom 404 Not Found Page' },
    { figure: 'Fig 4.10', path: '/contact', name: 'Contact Form', method: 'GET / POST', description: 'Contact Form Page of the Node.js Web Server' }
  ]);
});

app.get('/api/logs', (req, res) => {
  res.json(requestLogs);
});

app.get('/api/contact-submissions', (req, res) => {
  res.json(contactSubmissions);
});

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required fields.' });
  }
  
  const newSubmission = {
    id: Date.now(),
    name,
    email,
    subject: subject || 'General Inquiry',
    message,
    submittedAt: new Date().toISOString()
  };
  
  contactSubmissions.unshift(newSubmission);
  
  // If request is from traditional form POST, redirect back to contact page with success parameter
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    return res.redirect('/contact.html?submitted=true');
  }
  
  return res.json({
    success: true,
    message: 'Thank you! Your message has been received by the Node.js Web Server.',
    submission: newSubmission
  });
});

// 404 Custom Error Handling Middleware
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(publicDirectory, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});