'use client'

import MainLayout from '@/components/MainLayout'

export default function InquiriesPage() {
  return (
    <MainLayout
      navbarTitle="الاستعلامات"
      onBack={() => window.history.back()}
      menuOptions={[
        { label: 'بحث جديد', onClick: () => alert('بحث جديد') },
        { label: 'سجل الاستعلامات', onClick: () => alert('سجل الاستعلامات') },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">الاستعلامات</h1>
          <p className="mt-2 text-gray-600">تنفيذ الاستعلامات والبحث في النظام</p>
        </div>
        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
          <p className="text-gray-500">سيتم إضافة وظائف الاستعلامات قريبًا...</p>
        </div>
      </div>
    </MainLayout>
  )
} 