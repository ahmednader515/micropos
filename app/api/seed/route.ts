import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  return await POST()
}

export async function POST() {
  try {
    // Create sample categories
    const electronicsCategory = await prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: {
        name: 'Electronics',
        description: 'Electronic devices and accessories'
      }
    })

    const accessoriesCategory = await prisma.category.upsert({
      where: { name: 'Accessories' },
      update: {},
      create: {
        name: 'Accessories',
        description: 'Computer and mobile accessories'
      }
    })

    // Create sample products
    const products = await Promise.all([
      prisma.product.upsert({
        where: { name: 'Laptop Pro' },
        update: {},
        create: {
          name: 'Laptop Pro',
          description: 'High-performance laptop for professionals',
          price: 1299.99,
          costPrice: 900.00,
          stock: 15,
          minStock: 5,
          barcode: 'LP001',
          sku: 'LAPTOP-PRO-001',
          categoryId: electronicsCategory.id
        }
      }),
      prisma.product.upsert({
        where: { name: 'Wireless Mouse' },
        update: {},
        create: {
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse',
          price: 29.99,
          costPrice: 15.00,
          stock: 45,
          minStock: 10,
          barcode: 'WM001',
          sku: 'MOUSE-WIRELESS-001',
          categoryId: accessoriesCategory.id
        }
      }),
      prisma.product.upsert({
        where: { name: 'Mechanical Keyboard' },
        update: {},
        create: {
          name: 'Mechanical Keyboard',
          description: 'Premium mechanical keyboard with RGB',
          price: 89.99,
          costPrice: 45.00,
          stock: 23,
          minStock: 8,
          barcode: 'MK001',
          sku: 'KEYBOARD-MECH-001',
          categoryId: accessoriesCategory.id
        }
      })
    ])

    // Create sample customers
    const customers = await Promise.all([
      prisma.customer.upsert({
        where: { name: 'Ahmed Hassan' },
        update: {},
        create: {
          name: 'Ahmed Hassan',
          email: 'ahmed@example.com',
          phone: '+201234567890',
          address: 'Cairo, Egypt'
        }
      }),
      prisma.customer.upsert({
        where: { name: 'Fatima Ali' },
        update: {},
        create: {
          name: 'Fatima Ali',
          email: 'fatima@example.com',
          phone: '+201234567891',
          address: 'Alexandria, Egypt'
        }
      })
    ])

    // Create sample suppliers
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { name: 'Tech Supplies Co.' },
        update: {},
        create: {
          name: 'Tech Supplies Co.',
          email: 'info@techsupplies.com',
          phone: '+201234567892',
          address: 'Cairo, Egypt'
        }
      }),
      prisma.supplier.upsert({
        where: { name: 'Global Electronics' },
        update: {},
        create: {
          name: 'Global Electronics',
          email: 'contact@globalelec.com',
          phone: '+201234567893',
          address: 'Giza, Egypt'
        }
      })
    ])

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        categories: [electronicsCategory, accessoriesCategory],
        products,
        customers,
        suppliers
      }
    })

  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
} 