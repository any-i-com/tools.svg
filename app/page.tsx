'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Copy, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2,
  Settings,
  FileText,
  Image as ImageIcon,
  Zap
} from 'lucide-react'
import MonacoEditor from '@monaco-editor/react'
import { saveAs } from 'file-saver'
import { toPng } from 'html-to-image'
import SVGShapeGenerator from '@/components/SVGShapeGenerator'
import SVGOptimizer from '@/components/SVGOptimizer'

const defaultSvg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="#4f46e5" stroke="#1e1b4b" stroke-width="4"/>
  <rect x="70" y="70" width="60" height="60" fill="#fbbf24" stroke="#92400e" stroke-width="2" rx="8"/>
  <text x="100" y="110" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">SVG</text>
</svg>`

interface SvgInfo {
  width: string
  height: string
  viewBox: string
  elements: number
}

export default function Home() {
  const [svgCode, setSvgCode] = useState(defaultSvg)
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [svgInfo, setSvgInfo] = useState<SvgInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SVG Tools",
    "description": "专业的在线SVG编辑器，支持实时代码编辑、形状生成、SVG优化压缩、格式化",
    "url": "https://svg-tools.vercel.app",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "实时SVG代码编辑",
      "SVG形状生成器", 
      "SVG代码优化压缩",
      "SVG格式化",
      "导出PNG/SVG格式",
      "在线免费使用"
    ],
    "screenshot": "https://svg-tools.vercel.app/og-image.png",
    "softwareVersion": "1.0.0",
    "author": {
      "@type": "Organization",
      "name": "SVG Tools Team"
    }
  }

  // 解析SVG信息
  const parseSvgInfo = useCallback((code: string) => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(code, 'image/svg+xml')
      const svgElement = doc.querySelector('svg')
      
      if (svgElement) {
        const width = svgElement.getAttribute('width') || 'auto'
        const height = svgElement.getAttribute('height') || 'auto'
        const viewBox = svgElement.getAttribute('viewBox') || 'none'
        const elements = svgElement.querySelectorAll('*').length - 1
        
        setSvgInfo({ width, height, viewBox, elements })
        setError(null)
      } else {
        setError('无效的SVG格式')
        setSvgInfo(null)
      }
    } catch (e) {
      setError('SVG解析错误')
      setSvgInfo(null)
    }
  }, [])

  useEffect(() => {
    parseSvgInfo(svgCode)
  }, [svgCode, parseSvgInfo])

  // 文件上传处理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setSvgCode(content)
      }
      reader.readAsText(file)
    }
  }

  // 导出SVG
  const exportSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' })
    saveAs(blob, 'exported.svg')
  }

  // 导出为PNG
  const exportPng = async () => {
    const previewElement = document.getElementById('svg-preview')
    if (previewElement) {
      try {
        const dataUrl = await toPng(previewElement, { backgroundColor: 'white' })
        const link = document.createElement('a')
        link.download = 'exported.png'
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error('导出PNG失败:', error)
      }
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(svgCode)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  // 优化SVG代码
  const optimizeSvg = () => {
    const optimized = svgCode
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim()
    setSvgCode(optimized)
  }

  // 格式化SVG代码
  const formatSvg = () => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgCode, 'image/svg+xml')
      const serializer = new XMLSerializer()
      let formatted = serializer.serializeToString(doc)
      
      formatted = formatted.replace(/></g, '>\n<')
      const lines = formatted.split('\n')
      let indent = 0
      const indentSize = 2
      
      const formattedLines = lines.map(line => {
        const trimmed = line.trim()
        if (trimmed.startsWith('</')) {
          indent -= indentSize
        }
        const result = ' '.repeat(Math.max(0, indent)) + trimmed
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
          indent += indentSize
        }
        return result
      })
      
      setSvgCode(formattedLines.join('\n'))
    } catch (error) {
      console.error('格式化失败:', error)
    }
  }

  return (
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* 顶部工具栏 */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SVG Tools
                </h1>
                <div className="text-sm text-gray-500">
                  专业SVG编辑器
                </div>
              </div>
              
              <nav className="flex items-center space-x-2" aria-label="工具栏">
                <label className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer text-sm">
                  <Upload className="w-4 h-4 mr-2" />
                  上传SVG
                  <input
                    type="file"
                    accept=".svg"
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="上传SVG文件"
                  />
                </label>
                
                <button
                  onClick={exportSvg}
                  className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  aria-label="导出SVG文件"
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出SVG
                </button>
                
                <button
                  onClick={exportPng}
                  className="inline-flex items-center px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  aria-label="导出PNG图片"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  导出PNG
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  aria-label="复制SVG到剪贴板"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  复制
                </button>
                
                <div className="w-px h-6 bg-gray-300" role="separator"></div>
                
                <button
                  onClick={formatSvg}
                  className="inline-flex items-center px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                  aria-label="格式化SVG代码"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  格式化
                </button>
                
                <button
                  onClick={optimizeSvg}
                  className="inline-flex items-center px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  aria-label="优化SVG代码"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  优化
                </button>
                
                <button
                  onClick={() => setSvgCode(defaultSvg)}
                  className="inline-flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  aria-label="重置SVG代码"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重置
                </button>
                
                <div className="w-px h-6 bg-gray-300" role="separator"></div>
                
                <button
                  onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                  className="inline-flex items-center px-3 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                  aria-label={isPreviewVisible ? '隐藏预览' : '显示预览'}
                >
                  {isPreviewVisible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {isPreviewVisible ? '隐藏预览' : '显示预览'}
                </button>
                
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="inline-flex items-center px-3 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                  aria-label={isFullscreen ? '退出全屏' : '全屏模式'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto p-4">
          <section className={`grid gap-4 transition-all duration-300 ${
            isFullscreen 
              ? 'grid-cols-1' 
              : isPreviewVisible 
                ? 'grid-cols-1 lg:grid-cols-2' 
                : 'grid-cols-1'
          }`}>
            {/* 代码编辑器 */}
            <article className="bg-white rounded-xl shadow-lg overflow-hidden">
              <header className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">SVG 代码编辑器</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>行数: {svgCode.split('\n').length}</span>
                    <span>•</span>
                    <span>字符: {svgCode.length}</span>
                  </div>
                </div>
              </header>
              <div className="h-96">
                <MonacoEditor
                  height="384px"
                  language="xml"
                  theme="vs"
                  value={svgCode}
                  onChange={(value) => setSvgCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </div>
            </article>

            {/* SVG预览区域 */}
            {isPreviewVisible && (
              <article className="bg-white rounded-xl shadow-lg overflow-hidden">
                <header className="bg-gray-50 px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">实时预览</h2>
                    {svgInfo && (
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>尺寸: {svgInfo.width} × {svgInfo.height}</span>
                        <span>元素: {svgInfo.elements}</span>
                      </div>
                    )}
                  </div>
                </header>
                <div className="p-6">
                  <div className="flex items-center justify-center min-h-[384px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    {error ? (
                      <div className="text-red-500 text-center" role="alert">
                        <div className="text-lg font-semibold mb-2">⚠️ 错误</div>
                        <div>{error}</div>
                      </div>
                    ) : (
                      <div 
                        id="svg-preview"
                        className="max-w-full max-h-full"
                        dangerouslySetInnerHTML={{ __html: svgCode }}
                        role="img"
                        aria-label="SVG预览"
                      />
                    )}
                  </div>
                </div>
              </article>
            )}
          </section>

          {/* 工具面板区域 */}
          <section className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* SVG信息面板 */}
              {svgInfo && (
                <article className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    SVG 信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-blue-600 font-semibold text-sm">宽度</div>
                      <div className="text-lg font-bold text-blue-800">{svgInfo.width}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-green-600 font-semibold text-sm">高度</div>
                      <div className="text-lg font-bold text-green-800">{svgInfo.height}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg col-span-2">
                      <div className="text-purple-600 font-semibold text-sm">ViewBox</div>
                      <div className="text-sm font-bold text-purple-800 truncate">{svgInfo.viewBox}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg col-span-2">
                      <div className="text-orange-600 font-semibold text-sm">元素数量</div>
                      <div className="text-lg font-bold text-orange-800">{svgInfo.elements}</div>
                    </div>
                  </div>
                </article>
              )}
              
              {/* 形状生成器 */}
              <SVGShapeGenerator onShapeGenerated={(svg) => setSvgCode(svg)} />
              
              {/* SVG优化器 */}
              <SVGOptimizer svgCode={svgCode} onOptimized={(optimized) => setSvgCode(optimized)} />
            </div>
          </section>
        </div>
      </main>
    </>
  )
}