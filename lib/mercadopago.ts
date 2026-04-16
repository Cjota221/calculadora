import { MercadoPagoConfig, Payment } from 'mercadopago'

if (!process.env.MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN não definida')

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 10000 },
})

export const mpPayment = new Payment(mpClient)
