import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  data: string
  size?: number
  className?: string
}

function QRCodeDisplay({ data, size = 250, className = '' }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const url = await QRCode.toDataURL(data, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        })
        
        setQrCodeUrl(url)
      } catch (error) {
        console.error('QR 코드 생성 실패:', error)
        setError('QR 코드를 생성할 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (data) {
      generateQRCode()
    }
  }, [data, size])

  if (loading) {
    return (
      <div 
        className={`d-flex align-items-center justify-content-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">QR 코드 생성 중...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className={`d-flex align-items-center justify-content-center border rounded bg-light ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-center text-muted">
          <div className="mb-2">❌</div>
          <small>{error}</small>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <img 
        src={qrCodeUrl} 
        alt="QR Code"
        className="border rounded"
        style={{ width: size, height: size }}
      />
    </div>
  )
}

export default QRCodeDisplay 