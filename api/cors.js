const fetch = require('node-fetch');

  module.exports = async (req, res) => {
    const targetUrl = req.url.replace('/cors/', '');
    if (!targetUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid URL. Must start with http:// or https://' });
    }

    const allowedHeaders = [
      'accept',
      'accept-language',
      'authorization',
      'content-type',
      'user-agent'
    ];

    const requestHeaders = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (allowedHeaders.includes(key.toLowerCase())) {
        requestHeaders[key] = value;
      }
    }

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: requestHeaders,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      });

      const headers = {};
      for (const [key, value] of response.headers.entries()) {
        headers[key] = value;
      }
      headers['Access-Control-Allow-Origin'] = '*';
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      headers['Access-Control-Allow-Headers'] = allowedHeaders.join(', ');

      if (req.method === 'OPTIONS') {
        return res.status(200).set(headers).end();
      }

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).set(headers).json({
          error: `Request failed with status ${response.status}`,
          details: errorText
        });
      }

      const buffer = await response.buffer();
      res.status(response.status).set(headers).send(buffer);
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  };