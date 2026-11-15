import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      {
        name: 'api-serverless-routes',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/verify') || req.url?.startsWith('/api/generate')) {
              try {
                const route = req.url.startsWith('/api/generate') ? '/api/generate.js' : '/api/verify.js'
                const { default: handler } = await server.ssrLoadModule(route)
                return await handler(req, res)
              } catch (err) {
                console.error('API Error in dev server:', err)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: err.message }))
                return
              }
            }
            next()
          })
        },
      },
    ],
    resolve: {
      // shadcn-style `@/` imports (e.g. `@/components/ui/button`)
      alias: {
        '@': path.resolve(process.cwd(), './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'vendor-animations': ['gsap', 'animejs', 'motion'],
            'vendor-radix': [
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-label',
              '@radix-ui/react-progress',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-tabs',
            ],
            // NOTE: no vendor-charts chunk — recharts' d3-shape dep has a
            // broken package entry that fails Rollup resolution when forced
            // into its own chunk (verified: build error on d3-shape).
            // Recharts stays in the default chunk until that dep is fixed.
          },
        },
      },
    },
  }
})
