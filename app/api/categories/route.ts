import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeDatabaseOperation, buildTimeResponses } from '@/lib/api-helpers'

// Force dynamic rendering - disable static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return safeDatabaseOperation(
    async () => {
      await prisma.$connect()
      
      const categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc'
        }
      })

      await prisma.$disconnect()

      return {
        categories
      }
    },
    buildTimeResponses.categories,
    'Failed to fetch categories'
  )
} 