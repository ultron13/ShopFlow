import { router } from '../trpc'
import { productsRouter } from './products'
import { cartRouter } from './cart'
import { ordersRouter } from './orders'
import { reviewsRouter } from './reviews'
import { adminRouter } from './admin'
import { authRouter } from './auth'
import { wishlistRouter } from './wishlist'
import { stokvelRouter } from './stokvel'
import { vendorsRouter } from './vendors'
import { loadsheddingRouter } from './loadshedding'

export const appRouter = router({
  auth: authRouter,
  products: productsRouter,
  cart: cartRouter,
  orders: ordersRouter,
  reviews: reviewsRouter,
  admin: adminRouter,
  wishlist: wishlistRouter,
  stokvel: stokvelRouter,
  vendors: vendorsRouter,
  loadshedding: loadsheddingRouter,
})

export type AppRouter = typeof appRouter
