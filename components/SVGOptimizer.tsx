'use client'

import React, { useState } from 'react'
import { Zap, Settings, Info } from 'lucide-react'

interface SVGOptimizerProps {
  svgCode: string
  onOptimized: (optimizedSvg: string) => void
}

interface OptimizationOptions {
  removeComments: boolean
  removeEmptyElements: boolean
  removeWhitespace: boolean
  removeUnusedAttributes: boolean
  removeDefaultAttributes: boolean
  minifyNumbers: boolean
}

export default function SVGOptimizer({ svgCode, onOptimized }: SVGOptimizerProps) {
  const [options, setOptions] = useState<OptimizationOptions>({
    removeComments: true,
    removeEmptyElements: true,
    removeWhitespace: true,
    removeUnusedAttributes: false,
    removeDefaultAttributes: false,
    minifyNumbers: true,
  })

  const [optimizationResults, setOptimizationResults] = useState<{
    originalSize: number
    optimizedSize: number
    savings: number
  } | null>(null)

  const optimizeSvg = () => {
    let optimized = svgCode
    const originalSize = svgCode.length

    // 移除注释
    if (options.removeComments) {
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '')
    }

    // 移除空白符
    if (options.removeWhitespace) {
      optimized = optimized.replace(/\s+/g, ' ').trim()
      optimized = optimized.replace(/>\s+</g, '><')
    }

    // 移除空元素
    if (options.removeEmptyElements) {
      optimized = optimized.replace(/<([^>]+)>\s*<\/\1>/g, '')
    }

    // 压缩数字
    if (options.minifyNumbers) {
      optimized = optimized.replace(/(\d+\.\d+)/g, (match) => {
        return parseFloat(match).toString()
      })
    }

    // 移除默认属性
    if (options.removeDefaultAttributes) {
      optimized = optimized.replace(/\s+fill="none"/g, '')
      optimized = optimized.replace(/\s+stroke="none"/g, '')
      optimized = optimized.replace(/\s+stroke-width="1"/g, '')
    }

    const optimizedSize = optimized.length
    const savings = Math.round(((originalSize - optimizedSize) / originalSize) * 100)

    setOptimizationResults({
      originalSize,
      optimizedSize,
      savings,
    })

    onOptimized(optimized)
  }

  const toggleOption = (key: keyof OptimizationOptions) => {
    setOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const optionsList = [
    { key: 'removeComments' as const, label: '移除注释', description: '删除SVG中的注释内容' },
    { key: 'removeEmptyElements' as const, label: '移除空元素', description: '删除没有内容的元素' },
    { key: 'removeWhitespace' as const, label: '移除空白符', description: '压缩空格和换行符' },
    { key: 'removeUnusedAttributes' as const, label: '移除未使用属性', description: '删除不影响渲染的属性' },
    { key: 'removeDefaultAttributes' as const, label: '移除默认属性', description: '删除值为默认值的属性' },
    { key: 'minifyNumbers' as const, label: '压缩数字', description: '简化数字表示' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
        <Zap className="w-5 h-5 mr-2" />
        SVG 优化器
      </h3>

      {/* 优化选项 */}
      <div className="space-y-3 mb-6">
        {optionsList.map((option) => (
          <div key={option.key} className="flex items-start space-x-3">
            <input
              type="checkbox"
              id={option.key}
              checked={options[option.key]}
              onChange={() => toggleOption(option.key)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor={option.key} className="text-sm font-medium text-gray-700 cursor-pointer">
                {option.label}
              </label>
              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 优化按钮 */}
      <button
        onClick={optimizeSvg}
        className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
      >
        <Zap className="w-4 h-4 mr-2" />
        开始优化
      </button>

      {/* 优化结果 */}
      {optimizationResults && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Info className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">优化结果</span>
          </div>
          <div className="space-y-1 text-sm text-green-700">
            <div>原始大小: {optimizationResults.originalSize} 字符</div>
            <div>优化后大小: {optimizationResults.optimizedSize} 字符</div>
            <div className="font-semibold">
              节省: {optimizationResults.savings}% 
              ({optimizationResults.originalSize - optimizationResults.optimizedSize} 字符)
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 