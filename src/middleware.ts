import { publicRoutes } from './middleware/public-routes'
import { stackMiddlewares } from './middleware/stack-middlewares'
import { withAuth } from './middleware/with-clerk-auth'
import { withRateLimit } from './middleware/with-rate-limit'

export default stackMiddlewares([withRateLimit, withAuth])

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)","/","/(api|trpc)(.*)"]
}