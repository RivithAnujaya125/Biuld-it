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
            if (req.url?.startsWith('/api/verify')) {
              try {
                const { default: handler } = await server.ssrLoadModule('/api/verify.js')
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
  }
})
