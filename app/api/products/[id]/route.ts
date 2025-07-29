import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if we can connect to the database
    await prisma.$connect()
    
    const { id } = params
    const body = await request.json()

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: body,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Product updated successfully',
      product: {
        ...updatedProduct,
        price: Number(updatedProduct.price),
        costPrice: Number(updatedProduct.costPrice)
      }
    })

  } catch (error) {
    console.error('Error updating product:', error)
    
    // Return error if database is not available (during build)
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if we can connect to the database
    await prisma.$connect()
    
    const { id } = params

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    
    // Return error if database is not available (during build)
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 