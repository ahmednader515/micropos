import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isBuildTime, isVercelBuild, buildTimeResponses } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  if (isVercelBuild()) return NextResponse.json(buildTimeResponses.customers)
  try {
    const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ customers })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (isBuildTime() || isVercelBuild()) return NextResponse.json(buildTimeResponses.error, { status: 503 })
  try {
    const body = await request.json()
    const { name, email, phone, address, balance } = body
    if (!name || String(name).trim().length === 0) return NextResponse.json({ error: 'اسم العميل مطلوب' }, { status: 400 })

    const existing = await prisma.customer.findUnique({ where: { name } })
    if (existing) return NextResponse.json({ error: 'الاسم موجود مسبقاً' }, { status: 400 })

    const customer = await prisma.customer.create({
      data: {
        name: String(name).trim(),
        email: email || null,
        phone: phone || null,
        address: address || null,
        balance: balance != null ? Number(balance) : 0,
      },
    })
    return NextResponse.json({ message: 'تم إنشاء العميل', customer })
  } catch (e) {
    return NextResponse.json({ error: 'فشل إنشاء العميل' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (isBuildTime() || isVercelBuild()) return NextResponse.json(buildTimeResponses.error, { status: 503 })
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })
    const updated = await prisma.customer.update({ where: { id }, data })
    return NextResponse.json({ message: 'تم التحديث', customer: updated })
  } catch (e) {
    return NextResponse.json({ error: 'فشل التحديث' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (isBuildTime() || isVercelBuild()) return NextResponse.json(buildTimeResponses.error, { status: 503 })
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })
    await prisma.customer.delete({ where: { id } })
    return NextResponse.json({ message: 'تم الحذف' })
  } catch (e) {
    return NextResponse.json({ error: 'فشل الحذف' }, { status: 500 })
  }
}


