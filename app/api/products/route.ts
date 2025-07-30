import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeDatabaseOperation, buildTimeResponses, isBuildTime } from '@/lib/api-helpers'

// Force dynamic rendering - disable static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return safeDatabaseOperation(
    async () => {
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

export async function POST(request: Request) {
  if (isBuildTime()) {
    return NextResponse.json(
      buildTimeResponses.error,
      { status: 503 }
    )
  }

  try {
    await prisma.$connect()
    
    const body = await request.json()
    const { name, description, price, costPrice, stock, minStock, barcode, sku, categoryId } = body

    // Validate required fields
    if (!name || !price || stock === undefined) {
      return NextResponse.json(
        { error: 'Name, price, and stock are required' },
        { status: 400 }
      )
    }

    // Check if product name already exists
    const existingProduct = await prisma.product.findUnique({
      where: { name }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 400 }
      )
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price,
        costPrice: costPrice || 0,
        stock: stock || 0,
        minStock: minStock || 0,
        barcode: barcode || null,
        sku: sku || null,
        categoryId: categoryId || null,
        isActive: true
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    })

    await prisma.$disconnect()

    return NextResponse.json({
      message: 'Product created successfully',
      product: {
        ...product,
        price: Number(product.price),
        costPrice: Number(product.costPrice)
      }
    })

  } catch (error) {
    console.error('Error creating product:', error)
    
    if (isBuildTime()) {
      return NextResponse.json(
        buildTimeResponses.error,
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 