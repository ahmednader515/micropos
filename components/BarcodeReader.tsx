'use client'

import { useState, useRef, useEffect } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import Quagga from 'quagga'

interface BarcodeReaderProps {
  onResult: (result: string) => void
  onClose: () => void
  isVisible: boolean
}

export default function BarcodeReader({ onResult, onClose, isVisible }: BarcodeReaderProps) {
  const [error, setError] = useState<string>('')
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [scanMode, setScanMode] = useState<'image' | 'camera'>('image')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraContainerRef = useRef<HTMLDivElement>(null)

  // Cleanup Quagga when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (isCameraActive) {
        Quagga.stop()
      }
    }
  }, [isCameraActive])

  // Stop camera when modal closes
  useEffect(() => {
    if (!isVisible && isCameraActive) {
      Quagga.stop()
      setIsCameraActive(false)
    }
  }, [isVisible, isCameraActive])

  // Monitor camera container ref
  useEffect(() => {
    console.log('Camera container ref changed:', cameraContainerRef.current)
  }, [cameraContainerRef.current])

  const startCamera = () => {
    console.log('startCamera called')
    console.log('Quagga available:', typeof Quagga !== 'undefined')
    console.log('navigator.mediaDevices available:', !!navigator.mediaDevices)
    console.log('Camera container ref:', cameraContainerRef.current)
    
    // Add a small delay to ensure DOM is rendered
    setTimeout(() => {
      if (!cameraContainerRef.current) {
        console.error('Camera container ref is null after delay')
        setError('خطأ في تهيئة الكاميرا')
        return
      }

      console.log('Starting camera...')
      setError('')
      setIsCameraActive(true)

      // First, try to stop any existing Quagga instance
      try {
        Quagga.stop()
      } catch (e) {
        console.log('No existing Quagga instance to stop')
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('متصفحك لا يدعم الوصول إلى الكاميرا')
        setIsCameraActive(false)
        return
      }

      // Test camera access first
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          console.log('Camera access granted, stream:', stream)
          // Stop the test stream
          stream.getTracks().forEach(track => track.stop())
          
          // Now initialize Quagga
          initializeQuagga()
        })
        .catch((err) => {
          console.error('Camera access denied:', err)
          setError('تم رفض الوصول إلى الكاميرا. تأكد من السماح بالوصول إلى الكاميرا.')
          setIsCameraActive(false)
        })
    }, 100) // 100ms delay
  }

  const initializeQuagga = () => {
    if (!cameraContainerRef.current) {
      console.error('Camera container ref is null in initializeQuagga')
      setError('خطأ في تهيئة الكاميرا')
      setIsCameraActive(false)
      return
    }

    const config = {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: cameraContainerRef.current,
        constraints: {
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 180, ideal: 360, max: 720 },
          facingMode: "environment" as const, // Use back camera on mobile
          aspectRatio: 16/9
        },
      },
      locator: {
        patchSize: "large" as const,
        halfSample: false
      },
      numOfWorkers: 4,
      frequency: 25,
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ]
      },
      locate: true
    }

    console.log('Initializing Quagga with config:', config)

    Quagga.init(config, (err) => {
      if (err) {
        console.error('Quagga initialization error:', err)
        
        // Try with simpler config if the first one fails
        const simpleConfig = {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: cameraContainerRef.current!,
            constraints: {
              width: 640,
              height: 360,
              facingMode: "environment" as const,
              aspectRatio: 16/9
            },
          },
          locator: {
            patchSize: "medium" as const,
            halfSample: true
          },
          numOfWorkers: 2,
          frequency: 15,
          decoder: {
            readers: ["code_128_reader", "ean_reader", "code_39_reader"]
          },
          locate: true
        }

        console.log('Trying with simpler config...')
        Quagga.init(simpleConfig, (err2) => {
          if (err2) {
            console.error('Quagga simple config also failed:', err2)
            setError('فشل في تشغيل الكاميرا. تأكد من السماح بالوصول إلى الكاميرا.')
            setIsCameraActive(false)
            return
          }
          console.log('Quagga initialized successfully with simple config')
          Quagga.start()
        })
        return
      }
      
      console.log('Quagga initialized successfully')
      Quagga.start()
    })

    // Set up detection handler
    Quagga.onDetected((result) => {
      const code = result.codeResult.code
      console.log('Barcode detected:', code)
      onResult(code)
      // Stop camera after successful scan
      Quagga.stop()
      setIsCameraActive(false)
    })

    // Set up error handler
    Quagga.onProcessed((result) => {
      if (result) {
        console.log('Frame processed')
      }
    })
  }

  const stopCamera = () => {
    Quagga.stop()
    setIsCameraActive(false)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessingImage(true)
    setError('')

    try {
      // Create a new ZXing reader for image scanning
      const reader = new BrowserMultiFormatReader()
      
      // Convert file to image element
      const imageUrl = URL.createObjectURL(file)
      const img = new Image()
      
      img.onload = async () => {
        try {
          // Decode the image using ZXing
          const result = await reader.decodeFromImage(img)
          onResult(result.getText())
        } catch (decodeError: any) {
          console.error('ZXing decode error:', decodeError)
          setError('لم يتم العثور على باركود في الصورة. تأكد من أن الصورة واضحة وتحتوي على باركود.')
        } finally {
          setIsProcessingImage(false)
          URL.revokeObjectURL(imageUrl)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      }
      
      img.onerror = () => {
        setError('حدث خطأ في تحميل الصورة. تأكد من أن الملف صحيح.')
        setIsProcessingImage(false)
        URL.revokeObjectURL(imageUrl)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
      
      img.src = imageUrl
      
    } catch (err: any) {
      console.error('Image scan error:', err)
      setError('حدث خطأ أثناء قراءة الصورة. تأكد من أن الصورة واضحة.')
      setIsProcessingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleModeChange = (mode: 'image' | 'camera') => {
    if (isCameraActive) {
      stopCamera()
    }
    setScanMode(mode)
    setError('')
  }

  if (!isVisible) return null

  return (
    <>
      <style jsx>{`
        input[type="file"] {
          color: black !important;
        }
        input[type="text"] {
          color: black !important;
        }
        input[type="number"] {
          color: black !important;
        }
        textarea {
          color: black !important;
        }
        select {
          color: black !important;
        }
      `}</style>
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-3 w-full max-w-sm sm:max-w-md mx-4 max-h-[95vh] overflow-y-auto" style={{ color: 'black' }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-gray-900">قارئ الباركود</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-xs">
              {error}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleModeChange('image')}
                className={`flex-1 py-2 px-3 text-xs rounded-md transition-colors ${
                  scanMode === 'image' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📷 رفع صورة
              </button>
              <button
                onClick={() => handleModeChange('camera')}
                className={`flex-1 py-2 px-3 text-xs rounded-md transition-colors ${
                  scanMode === 'camera' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📹 كاميرا مباشرة
              </button>
            </div>
          </div>

          {scanMode === 'image' ? (
            /* Image Upload Mode */
            <div className="text-center">
              <div className="mb-3">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-black mb-3 text-sm">اختر صورة تحتوي على باركود</p>
              <div className="text-center text-xs text-gray-500 mb-3">
                <p>نصائح للصور:</p>
                <p>• تأكد من أن الباركود واضح ومضاء جيداً</p>
                <p>• تجنب الظلال والانعكاسات</p>
                <p>• استخدم صور عالية الدقة</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                {isProcessingImage ? 'جاري المعالجة...' : 'اختيار صورة'}
              </button>
            </div>
          ) : (
            /* Camera Mode */
            <div className="text-center">
              <div className="mb-3">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              
              {/* Camera container - responsive for mobile */}
              <div 
                ref={cameraContainerRef}
                className={`w-full aspect-video rounded-lg overflow-hidden mb-3 relative ${
                  isCameraActive ? 'bg-gray-100' : 'bg-gray-200'
                }`}
              >
                {!isCameraActive && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs">كاميرا غير نشطة</p>
                    </div>
                  </div>
                )}
                
                {/* Scanning overlay when camera is active - responsive */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Corner guides - smaller on mobile */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-t-2 border-green-500"></div>
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-t-2 border-green-500"></div>
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-b-2 border-green-500"></div>
                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-b-2 border-green-500"></div>
                    
                    {/* Center scanning area - responsive */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-12 sm:w-48 sm:h-16 border-2 border-green-500 border-dashed"></div>
                    
                    {/* Scanning animation - responsive */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-1 sm:w-48 sm:h-1 bg-green-500 animate-pulse"></div>
                  </div>
                )}
              </div>
              
              {!isCameraActive ? (
                <>
                  <p className="text-black mb-3 text-sm">استخدم الكاميرا لمسح الباركود</p>
                  <div className="text-center text-xs text-gray-500 mb-3">
                    <p>نصائح للمسح:</p>
                    <p>• ضع الباركود في وسط الإطار المحدد</p>
                    <p>• تأكد من إضاءة جيدة وعدم وجود ظلال</p>
                    <p>• حافظ على الكاميرا ثابتة على بعد 10-20 سم</p>
                    <p>• تأكد من أن الباركود واضح وغير مكسور</p>
                  </div>
                  <button
                    onClick={() => {
                      console.log('Camera button clicked')
                      startCamera()
                    }}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    تشغيل الكاميرا
                  </button>
                </>
              ) : (
                <>
                  <p className="text-black mb-3 text-sm">وجه الكاميرا نحو الباركود</p>
                  <button
                    onClick={stopCamera}
                    className="bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    إيقاف الكاميرا
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
} 