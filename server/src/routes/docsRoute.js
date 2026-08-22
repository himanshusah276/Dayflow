import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const openapiPath = path.join(__dirname, '../docs/openapi.json');

// Serve raw OpenAPI JSON
router.get('/openapi.json', (req, res) => {
  if (fs.existsSync(openapiPath)) {
    const spec = JSON.parse(fs.readFileSync(openapiPath, 'utf-8'));
    return res.json(spec);
  }
  return res.status(404).json({ error: 'OpenAPI specification not found.' });
});

// Serve Interactive Swagger / Redoc-like documentation UI
router.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Dayflow HRMS — REST API Reference</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      <style>
        body { margin: 0; background: #0f172a; font-family: sans-serif; }
        .swagger-ui .topbar { display: none; }
        .hero { background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); color: white; padding: 24px 32px; border-bottom: 1px solid #334155; }
        .hero h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .hero p { margin: 6px 0 0 0; color: #94a3b8; font-size: 13px; }
        #swagger-ui { background: #ffffff; padding: 20px; border-radius: 16px; margin: 24px auto; max-width: 1200px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); }
      </style>
    </head>
    <body>
      <div class="hero">
        <h1>Dayflow HRMS — Production REST API Reference</h1>
        <p>Interactive OpenAPI Documentation for Authentication, Employees, Attendance, Leaves, Payroll, and Analytics</p>
      </div>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api/docs/openapi.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout"
          });
        };
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

export default router;
