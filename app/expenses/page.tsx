'use client'

import MainLayout from '@/components/MainLayout'

export default function ExpensesPage() {
  return (
    <MainLayout
      navbarTitle="المصروفات"
      onBack={() => window.history.back()}
      menuOptions={[
        { label: 'تقرير المصروفات', onClick: () => alert('تقرير المصروفات') },
        { label: 'إضافة مصروف', onClick: () => alert('إضافة مصروف') },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">المصروفات</h1>
          <p className="mt-2 text-gray-600">متابعة مصروفات العمل</p>
        </div>
        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
          <p className="text-gray-500">سيتم إضافة وظائف إدارة المصروفات قريبًا...</p>
        </div>
      </div>
    </MainLayout>
  )
} 