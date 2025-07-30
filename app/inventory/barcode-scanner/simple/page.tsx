"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function SimpleBarcodeScanner() {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        html5QrCodeRef.current = new Html5Qrcode("reader");
        
        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        setCameras(devices);
        
        if (devices.length > 0) {
          // Prefer back camera if available
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear')
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
        }
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
        setError("Failed to access camera. Please check permissions.");
      }
    };

    initializeScanner();

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!html5QrCodeRef.current || !selectedCamera) return;

    try {
      setIsScanning(true);
      setError(null);
      setBarcodeResult(null);

      await html5QrCodeRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: [
            "CODE_128",
            "CODE_39", 
            "EAN_13",
            "EAN_8",
            "UPC_A",
            "UPC_E",
            "ITF",
            "CODABAR"
          ]
        },
        (decodedText, decodedResult) => {
          console.log("Barcode detected:", decodedText);
          setBarcodeResult(decodedText);
          setIsScanning(false);
          
          // Optional: Stop scanning after successful scan
          // html5QrCodeRef.current?.stop();
        },
        (errorMessage) => {
          // Most errors are just "not found" which is normal
          if (errorMessage.includes("NotFoundException")) {
            return;
          }
          console.warn("Scan error:", errorMessage);
        }
      );
    } catch (err) {
      console.error("Failed to start scanning:", err);
      setError("Failed to start camera scanning.");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanning:", err);
      }
    }
  };

  const handleReset = () => {
    setBarcodeResult(null);
    setError(null);
    startScanning();
  };

  const handleCameraChange = (cameraId: string) => {
    setSelectedCamera(cameraId);
    if (isScanning) {
      stopScanning().then(() => {
        setTimeout(() => startScanning(), 500);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Barcode Scanner
          </h1>

          {/* Camera Selection */}
          {cameras.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Camera:
              </label>
              <select
                value={selectedCamera}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="w-full max-w-md mx-auto block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Scanner Container */}
          <div className="mb-6">
            <div 
              id="reader" 
              className="w-full max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden"
            ></div>
          </div>

          {/* Control Buttons */}
          <div className="text-center mb-6 space-x-4">
            {!isScanning && !barcodeResult && (
              <button
                onClick={startScanning}
                disabled={!selectedCamera}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Start Scanning
              </button>
            )}
            
            {isScanning && (
              <button
                onClick={stopScanning}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Scanning
              </button>
            )}
          </div>

          {/* Status Messages */}
          {isScanning && !barcodeResult && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Scanning for barcodes...
              </div>
            </div>
          )}

          {error && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Results */}
          {barcodeResult && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Barcode Detected:</span>
                <span className="ml-2 font-mono text-lg">{barcodeResult}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-center space-x-4">
            {barcodeResult && (
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Scan Another Barcode
              </button>
            )}
            
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center text-gray-600">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ul className="text-sm space-y-1">
              <li>• Select a camera if multiple are available</li>
              <li>• Click "Start Scanning" to begin</li>
              <li>• Point your camera at a barcode</li>
              <li>• Hold steady for best results</li>
              <li>• Works with most common barcode formats</li>
              <li>• Ensure good lighting for optimal scanning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 