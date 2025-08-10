import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/cashbox - Get cashbox balance and transactions
export async function GET() {
  try {
    // Get all transactions
    const transactions = await prisma.cashboxTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 transactions
    })

    // Calculate current balance
    const balance = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'INCOME') {
        return acc + parseFloat(transaction.amount.toString())
      } else {
        return acc - parseFloat(transaction.amount.toString())
      }
    }, 0)

    return NextResponse.json({
      balance: balance.toFixed(2),
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount.toString(),
        description: t.description,
        reference: t.reference,
        paymentMethod: t.paymentMethod,
        createdAt: t.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching cashbox data:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الصندوق' },
      { status: 500 }
    )
  }
}

// POST /api/cashbox - Add new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, amount, description, reference, paymentMethod = 'CASH' } = body

    // Validate required fields
    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'النوع والمبلغ والوصف مطلوبة' },
        { status: 400 }
      )
    }

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'المبلغ يجب أن يكون رقماً موجباً' },
        { status: 400 }
      )
    }

    // Check if this would result in negative balance for EXPENSE transactions
    if (type === 'EXPENSE') {
      const currentTransactions = await prisma.cashboxTransaction.findMany()
      const currentBalance = currentTransactions.reduce((acc, transaction) => {
        if (transaction.type === 'INCOME') {
          return acc + parseFloat(transaction.amount.toString())
        } else {
          return acc - parseFloat(transaction.amount.toString())
        }
      }, 0)

      if (currentBalance - amountNum < 0) {
        return NextResponse.json(
          { error: 'رصيد الصندوق غير كافي لإتمام هذه العملية' },
          { status: 400 }
        )
      }
    }

    // Create transaction
    const transaction = await prisma.cashboxTransaction.create({
      data: {
        type,
        amount: amountNum,
        description,
        reference,
        paymentMethod
      }
    })

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
