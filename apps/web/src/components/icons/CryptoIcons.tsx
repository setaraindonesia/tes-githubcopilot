'use client'

import React, { useState } from 'react'

// USDC Icon SVG (Simplified official design)
export const USDCIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  const [imgSrc, setImgSrc] = useState<string | null>("/images/usdc.png")
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0)

  if (imgSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imgSrc}
        alt="USDC"
        className={className}
        referrerPolicy="no-referrer"
        onError={() => {
          if (step === 0) {
            setImgSrc("https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/usdc.svg")
            setStep(1)
          } else if (step === 1) {
            setImgSrc("https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=028")
            setStep(2)
          } else if (step === 2) {
            setImgSrc("https://images.brandfetch.io/idPw8X774n/logo")
            setStep(3)
          } else {
            setImgSrc(null)
            setStep(4)
          }
        }}
      />
    )
  }

  // Final inline fallback if remotes also fail
  return (
    <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="USDC">
      <g fill="none" fillRule="evenodd">
        <circle cx="16" cy="16" r="16" fill="#2775CA"/>
        <path d="M11.2 8.8C8.5 10.1 6.6 12.9 6.6 16s1.9 5.9 4.6 7.2v-1.8c-2-1.1-3.3-3.1-3.3-5.4s1.3-4.2 3.3-5.3V8.8zm9.6 0v1.8c2 1.1 3.3 3.1 3.3 5.4s-1.3 4.3-3.3 5.4V23.2c2.8-1.3 4.6-4.1 4.6-7.2s-1.9-5.9-4.6-7.2z" fill="#FFF"/>
        <path d="M17.7 20.6c2-.3 3.4-1.7 3.4-3.6 0-2.3-1.9-3.6-4.8-3.9V10h-2v3c-1 .1-2 .4-2.8.8v2.1c.8-.4 1.8-.7 2.8-.9 2 .3 2.9.8 2.9 1.9 0 1-.8 1.6-2.9 1.9-2 .3-3.8 1.2-3.8 3.6 0 2 1.6 3.3 4 3.6V26h2v-2.9c1-.1 2-.4 2.8-.8v-2.2c-.9.5-1.8.8-2.8.9-2.1-.2-3.1-.7-3.1-1.8 0-1.1.9-1.6 3.1-1.8z" fill="#FFF"/>
      </g>
    </svg>
  )
}

// USDT Icon SVG (Based on official design)
export const USDTIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#26A17B"/>
      <g fill="#FFF">
        <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117"/>
      </g>
    </g>
  </svg>
)

// Ethereum Icon SVG (Based on official design)
export const ETHIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <g fill="#FFF" fillRule="nonzero">
        <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z"/>
        <path d="M16.498 4L9 16.22l7.498-3.35z"/>
        <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z"/>
        <path d="M16.498 27.995v-6.028L9 17.616z"/>
        <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z"/>
        <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z"/>
      </g>
    </g>
  </svg>
)

// Base Network Icon SVG (Official design)
export const BaseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#0052FF"/>
      <path d="M16.002 4C9.384 4 4 9.384 4 16s5.384 12 12.002 12c5.595 0 10.29-3.824 11.622-9H16.002V4z" fill="#FFF"/>
    </g>
  </svg>
)

// SETARA Points Icon SVG
export const SetaraIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  const [src, setSrc] = React.useState<string | null>("/images/icon setara 2.jpeg")
  const [step, setStep] = React.useState<0 | 1 | 2 | 3>(0)

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="SETARA Points"
        className={className}
        referrerPolicy="no-referrer"
        onError={() => {
          if (step === 0) {
            setSrc("/images/setara-points.png")
            setStep(1)
          } else if (step === 1) {
            setSrc("https://i.imgur.com/izG957s.png")
            setStep(2)
          } else {
            setSrc(null)
            setStep(3)
          }
        }}
      />
    )
  }

  // Inline fallback if image sources fail
  return (
    <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="SETARA">
      <g fill="none" fillRule="evenodd">
        <circle cx="16" cy="16" r="16" fill="#F59E0B"/>
        <path d="M16 4l3.708 7.514L28 12.944l-6.146 5.994L23.416 28 16 24.472 8.584 28l1.562-9.062L4 12.944l8.292-1.43L16 4z" fill="#FFF"/>
      </g>
    </svg>
  )
}

// Generic Coin Icon SVG
export const CoinIcon: React.FC<{ className?: string; color?: string }> = ({ 
  className = "w-6 h-6", 
  color = "#6B7280" 
}) => (
  <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill={color}/>
      <path d="M16 6c5.523 0 10 4.477 10 10s-4.477 10-10 10S6 21.523 6 16 10.477 6 16 6zm0 2C11.582 8 8 11.582 8 16s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 3c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm0 2c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" fill="#FFF"/>
    </g>
  </svg>
)

// Wallet Icon SVG
export const WalletIconSVG: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#4F46E5"/>
      <path d="M8 10a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H10a2 2 0 01-2-2V10zm2 0v12h12V10H10zm8 6a1 1 0 100-2 1 1 0 000 2z" fill="#FFF"/>
    </g>
  </svg>
)

export default {
  USDCIcon,
  USDTIcon,
  ETHIcon,
  BaseIcon,
  SetaraIcon,
  CoinIcon,
  WalletIconSVG
}
