import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // During build time, return mock data to prevent build failures
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return NextResponse.json({
      products: []
    })
  }

  try {
    // Check if we can connect to the database
    await prisma.$connect()
    
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      products: products.map(product => ({
        ...product,
        price: Number(product.price),
        costPrice: Number(product.costPrice)
      }))
    })

  } catch (error) {
    console.error('Error fetching products for sales:', error)
    
    // Return empty array if database is not available (during build)
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({
        products: []
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 