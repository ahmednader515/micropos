import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeDatabaseOperation, isBuildTime, isVercelBuild } from '@/lib/api-helpers'

// Force dynamic rendering - disable static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

const fallbackCashbox = {
  balance: '0.00',
  transactions: [] as Array<{
    id: string
    type: 'INCOME' | 'EXPENSE'
    amount: string
    description: string | null
    reference: string | null
    paymentMethod: string
    createdAt: string
  }>
}

// GET /api/cashbox - Get cashbox balance and transactions
export async function GET() {
  // Immediate fallback for Vercel build environments
  if (isVercelBuild()) {
    return NextResponse.json(fallbackCashbox)
  }

  return safeDatabaseOperation(
    async () => {
      await prisma.$connect()

      const transactions = await prisma.cashboxTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit to last 100 transactions
      })

      await prisma.$disconnect()

      const balance = transactions.reduce((acc, transaction) => {
        if (transaction.type === 'INCOME') {
          return acc + Number(transaction.amount)
        }
        return acc - Number(transaction.amount)
      }, 0)

      return {
        balance: balance.toFixed(2),
        transactions: transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount.toString(),
          description: t.description ?? '',
          reference: t.reference ?? '',
          paymentMethod: t.paymentMethod,
          createdAt: t.createdAt.toISOString()
        }))
      }
    },
    fallbackCashbox,
    'Failed to fetch cashbox data'
  )
}

// POST /api/cashbox - Add new transaction
export async function POST(request: NextRequest) {
  // Only block during actual build time, not in deployed environment
  if (isBuildTime()) {
    return NextResponse.json(
      { error: 'Service unavailable during build/deploy' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { type, amount, description, reference, paymentMethod = 'CASH' } = body

    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'النوع والمبلغ والوصف مطلوبة' },
        { status: 400 }
      )
    }

    const amountNum = parseFloat(String(amount))
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'المبلغ يجب أن يكون رقماً موجباً' },
        { status: 400 }
      )
    }

    // Prevent negative balance on EXPENSE
    if (type === 'EXPENSE') {
      await prisma.$connect()
      const currentTransactions = await prisma.cashboxTransaction.findMany()
      const currentBalance = currentTransactions.reduce((acc, transaction) => {
        if (transaction.type === 'INCOME') {
          return acc + Number(transaction.amount)
        }
        return acc - Number(transaction.amount)
      }, 0)

      if (currentBalance - amountNum < 0) {
        await prisma.$disconnect()
        return NextResponse.json(
          { error: 'رصيد الصندوق غير كافي لإتمام هذه العملية' },
          { status: 400 }
        )
      }
    }

    // Create transaction
    await prisma.$connect()
    const transaction = await prisma.cashboxTransaction.create({
      data: {
        type,
        amount: amountNum,
        description,
        reference,
        paymentMethod
      }
    })
    await prisma.$disconnect()

    return NextResponse.json({
      message: type === 'INCOME' ? 'تم إضافة المبلغ بنجاح' : 'تم سحب المبلغ بنجاح',
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        reference: transaction.reference,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating cashbox transaction:', error)
    return NextResponse.json(
      { error: 'فشل في إتمام العملية' },
      { status: 500 }
    )
  }
}
