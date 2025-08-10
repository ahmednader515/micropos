'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import FlashNotification from '@/components/FlashNotification'

interface CashboxTransaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: string
  description: string
  reference: string
  paymentMethod: string
  createdAt: string
}

interface CashboxData {
  balance: string
  transactions: CashboxTransaction[]
}

export default function CashboxPage() {
  const [cashboxData, setCashboxData] = useState<CashboxData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showSubtractForm, setShowSubtractForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    reference: ''
  })
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    fetchCashboxData()
  }, [])

  const fetchCashboxData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cashbox')
      if (response.ok) {
        const data = await response.json()
        setCashboxData(data)
      } else {
        throw new Error('فشل في جلب بيانات الصندوق')
      }
    } catch (error) {
      showNotification('error', 'فشل في جلب بيانات الصندوق')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (type: 'INCOME' | 'EXPENSE') => {
    try {
      if (!formData.amount || !formData.description) {
        showNotification('error', 'جميع الحقول مطلوبة')
        return
      }

      const amount = parseFloat(formData.amount)
      if (amount <= 0) {
        showNotification('error', 'المبلغ يجب أن يكون أكبر من صفر')
        return
      }

      // Additional validation for EXPENSE transactions
      if (type === 'EXPENSE' && cashboxData) {
        const currentBalance = parseFloat(cashboxData.balance)
        if (currentBalance < amount) {
          showNotification('error', `رصيد الصندوق غير كافي. الرصيد الحالي: ${formatCurrency(cashboxData.balance)}`)
          return
        }
      }

      setSubmitting(true)
      const response = await fetch('/api/cashbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          amount,
          description: formData.description,
          reference: formData.reference || undefined
        })
      })

      if (response.ok) {
        showNotification('success', type === 'INCOME' ? 'تم إضافة المبلغ بنجاح' : 'تم سحب المبلغ بنجاح')
        setFormData({ amount: '', description: '', reference: '' })
        setShowAddForm(false)
        setShowSubtractForm(false)
        fetchCashboxData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إتمام العملية')
      }
    } catch (error: any) {
      showNotification('error', error.message || 'فشل في إتمام العملية')
    } finally {
      setSubmitting(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionTypeLabel = (type: string) => {
    return type === 'INCOME' ? 'إضافة' : 'سحب'
  }

  const getTransactionTypeColor = (type: string) => {
    return type === 'INCOME' ? 'text-green-600' : 'text-red-600'
  }

  const getTransactionTypeBgColor = (type: string) => {
    return type === 'INCOME' ? 'bg-green-50' : 'bg-red-50'
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      'CASH': 'نقداً',
      'CARD': 'بطاقة',
      'CHECK': 'شيك',
      'CASHBOX': 'صندوق',
      'BANK_TRANSFER': 'تحويل بنكي',
      'MOBILE_PAYMENT': 'دفع إلكتروني'
    }
    return labels[method] || method
  }

  if (loading) {
    return (
      <MainLayout
        navbarTitle="الصندوق"
        onBack={() => window.history.back()}
        menuOptions={[]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">جاري التحميل...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout
      navbarTitle="الصندوق"
      onBack={() => window.history.back()}
      menuOptions={[]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">الصندوق</h1>
          <p className="mt-2 text-gray-600">متابعة وإدارة الصندوق</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="text-center">
            <h2 className="text-lg font-medium">الرصيد الحالي</h2>
            <p className="text-3xl font-bold mt-2">
              {cashboxData ? formatCurrency(cashboxData.balance) : '0.00 ر.س'}
            </p>
            <div className="mt-2 text-blue-100 text-sm">
              آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setShowAddForm(true)}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإضافة...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة مبلغ
              </>
            )}
          </button>
          <button
            onClick={() => setShowSubtractForm(true)}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري السحب...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                سحب مبلغ
              </>
            )}
          </button>
        </div>

        {/* Add Money Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">إضافة مبلغ للصندوق</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل المبلغ"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="وصف العملية"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المرجع (اختياري)</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="رقم الفاتورة أو المرجع"
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSubmit('INCOME')}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {submitting ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subtract Money Form */}
        {showSubtractForm && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">سحب مبلغ من الصندوق</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل المبلغ"
                  required
                  disabled={submitting}
                />
                {cashboxData && (
                  <p className="mt-1 text-sm text-gray-500">
                    الرصيد المتاح: {formatCurrency(cashboxData.balance)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="وصف العملية"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المرجع (اختياري)</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="رقم الفاتورة أو المرجع"
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSubmit('EXPENSE')}
                  disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {submitting ? 'جاري السحب...' : 'سحب'}
                </button>
                <button
                  onClick={() => setShowSubtractForm(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transactions History */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">سجل العمليات</h3>
            <p className="text-sm text-gray-500 mt-1">آخر {cashboxData?.transactions.length || 0} عملية</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm" dir="rtl">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">التاريخ</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">النوع</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">المبلغ</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">الوصف</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">طريقة الدفع</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">المرجع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cashboxData?.transactions.map((transaction) => (
                  <tr key={transaction.id} className={`hover:bg-gray-50 ${getTransactionTypeBgColor(transaction.type)}`}>
                    <td className="px-6 py-4 text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)} ${getTransactionTypeBgColor(transaction.type)}`}>
                        {getTransactionTypeLabel(transaction.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {getPaymentMethodLabel(transaction.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {transaction.reference || '-'}
                    </td>
                  </tr>
                ))}
                {(!cashboxData?.transactions || cashboxData.transactions.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      لا توجد عمليات حتى الآن
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <FlashNotification
          type={notification.type}
          message={notification.message}
          isVisible={!!notification}
          onClose={() => setNotification(null)}
        />
      )}
    </MainLayout>
  )
} 