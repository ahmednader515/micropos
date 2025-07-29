import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if we can connect to the database
    await prisma.$connect()
    
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      categories
    })

  } catch (error) {
    console.error('Error fetching categories:', error)
    
    // Return empty array if database is not available (during build)
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json({
        categories: []
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 