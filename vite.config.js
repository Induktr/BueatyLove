import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Custom middleware to handle API requests
function apiMiddleware() {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          // Parse URL and query parameters
          const url = new URL(req.url, `http://${req.headers.host}`);
          const endpoint = url.pathname;
          
          // First try direct handler path
          let handlerPath = resolve(__dirname, 'api', `${endpoint.split('/').pop()}.js`);
          
          // If not found, try in handlers directory
          if (!fs.existsSync(handlerPath)) {
            handlerPath = resolve(__dirname, 'api/handlers', `${endpoint.split('/').pop()}.js`);
          }
          
          if (fs.existsSync(handlerPath)) {
            // Set proper headers
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store, max-age=0');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            
            // Create proper request object with query parameters
            const request = {
              ...req,
              query: Object.fromEntries(url.searchParams),
              body: req.body,
              method: req.method,
              headers: req.headers,
              // Add helper methods
              status: function(code) {
                res.statusCode = code;
                return res;
              },
              json: function(data) {
                if (!res.headersSent) {
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                }
                res.end(JSON.stringify(data));
                return res;
              }
            };
            
            // Add response helper methods
            res.status = function(code) {
              this.statusCode = code;
              return this;
            };
            
            res.json = function(data) {
              if (!this.headersSent) {
                this.setHeader('Content-Type', 'application/json; charset=utf-8');
              }
              this.end(JSON.stringify(data));
              return this;
            };
            
            try {
              // Import and execute the API handler
              const module = await import(handlerPath + '?t=' + Date.now());
              const handler = module.default;
              
              if (typeof handler !== 'function') {
                throw new Error(`Handler for ${endpoint} is not a function`);
              }
              
              await handler(request, res);
            } catch (handlerError) {
              console.error(`Handler Error (${endpoint}):`, handlerError);
              if (!res.headersSent) {
                res.status(500).json({
                  status: 'error',
                  error: 'Internal Server Error',
                  message: handlerError.message
                });
              }
            }
          } else {
            next();
          }
        } catch (error) {
          console.error(`API Middleware Error:`, error);
          
          if (!res.headersSent) {
            res.status(500).json({
              status: 'error',
              error: 'Internal Server Error',
              message: error.message
            });
          }
        }
      });
    }
  };
}

export default defineConfig({
  root: '.',
  base: '/',
  plugins: [apiMiddleware()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        prices: resolve(__dirname, 'src/pages/prices.html'),
        about: resolve(__dirname, 'src/pages/about.html')
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  }
});
