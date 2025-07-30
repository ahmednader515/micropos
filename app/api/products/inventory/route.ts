import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeDatabaseOperation, buildTimeResponses } from '@/lib/api-helpers'

export async function GET() {
  return safeDatabaseOperation(
    async () => {
      await prisma.$connect()
      
      const products = await prisma.product.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      await prisma.$disconnect()

      return {
        products: products.map(product => ({
          ...product,
          price: Number(product.price),
          costPrice: Number(product.costPrice)
        }))
      }
    },
    buildTimeResponses.products,
    'Failed to fetch products'
  )
} 