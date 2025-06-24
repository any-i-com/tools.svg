'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Wand2, 
  RotateCcw, 
  Palette,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface SmartDrawingProps {
  onSvgGenerated: (svg: string) => void
}

interface Point {
  x: number
  y: number
}

interface RecognizedShape {
  id: string
  type: 'line' | 'circle' | 'rectangle' | 'triangle' | 'curve'
  points: Point[]
  strokeColor: string
  fillColor: string
  strokeWidth: number
  filled: boolean
  confidence: number
}

export default function SVGSmartDrawing({ onSvgGenerated }: SmartDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [recognizedShapes, setRecognizedShapes] = useState<RecognizedShape[]>([])
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [fillColor, setFillColor] = useState('#transparent')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [filled, setFilled] = useState(false)
  const [lastRecognition, setLastRecognition] = useState<string>('')
  const [autoTrim, setAutoTrim] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  const canvasSize = { width: 800, height: 600 }

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substr(2, 9)

  // 获取鼠标在画布上的坐标
  const getCanvasCoordinates = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    }
  }, [])

  // 计算两点之间的距离
  const distance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  // 计算角度
  const angle = (p1: Point, p2: Point, p3: Point): number => {
    const a = distance(p2, p3)
    const b = distance(p1, p3)
    const c = distance(p1, p2)
    return Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180 / Math.PI
  }

  // 平滑路径 - 使用道格拉斯-普克算法简化
  const smoothPath = (points: Point[], tolerance: number = 5): Point[] => {
    if (points.length <= 2) return points

    const simplified: Point[] = []
    
    // 找到距离直线最远的点
    const findFarthest = (start: number, end: number): number => {
      let maxDist = 0
      let maxIndex = start
      
      for (let i = start + 1; i < end; i++) {
        const dist = pointToLineDistance(points[i], points[start], points[end])
        if (dist > maxDist) {
          maxDist = dist
          maxIndex = i
        }
      }
      
      return maxDist > tolerance ? maxIndex : -1
    }

    const simplify = (start: number, end: number) => {
      const farthest = findFarthest(start, end)
      
      if (farthest !== -1) {
        simplify(start, farthest)
        simplified.push(points[farthest])
        simplify(farthest, end)
      }
    }

    simplified.push(points[0])
    simplify(0, points.length - 1)
    simplified.push(points[points.length - 1])

    return simplified
  }

  // 计算点到直线的距离
  const pointToLineDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x
    const B = point.y - lineStart.y
    const C = lineEnd.x - lineStart.x
    const D = lineEnd.y - lineStart.y

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    
    if (lenSq === 0) return distance(point, lineStart)
    
    const param = dot / lenSq
    
    let xx: number, yy: number
    
    if (param < 0) {
      xx = lineStart.x
      yy = lineStart.y
    } else if (param > 1) {
      xx = lineEnd.x
      yy = lineEnd.y
    } else {
      xx = lineStart.x + param * C
      yy = lineStart.y + param * D
    }
    
    const dx = point.x - xx
    const dy = point.y - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  // 识别形状
  const recognizeShape = (points: Point[]): RecognizedShape => {
    if (points.length < 3) {
      return {
        id: generateId(),
        type: 'curve',
        points,
        strokeColor,
        fillColor,
        strokeWidth,
        filled,
        confidence: 0.5
      }
    }

    const smoothed = smoothPath(points, 8)
    
    // 检查是否是直线
    if (isLine(smoothed)) {
      return {
        id: generateId(),
        type: 'line',
        points: [smoothed[0], smoothed[smoothed.length - 1]],
        strokeColor,
        fillColor,
        strokeWidth,
        filled,
        confidence: 0.9
      }
    }

    // 检查是否是圆形
    const circleResult = isCircle(smoothed)
    if (circleResult.isCircle) {
      return {
        id: generateId(),
        type: 'circle',
        points: circleResult.points,
        strokeColor,
        fillColor,
        strokeWidth,
        filled,
        confidence: circleResult.confidence
      }
    }

    // 检查是否是矩形
    const rectResult = isRectangle(smoothed)
    if (rectResult.isRectangle) {
      return {
        id: generateId(),
        type: 'rectangle',
        points: rectResult.points,
        strokeColor,
        fillColor,
        strokeWidth,
        filled,
        confidence: rectResult.confidence
      }
    }

    // 检查是否是三角形
    const triangleResult = isTriangle(smoothed)
    if (triangleResult.isTriangle) {
      return {
        id: generateId(),
        type: 'triangle',
        points: triangleResult.points,
        strokeColor,
        fillColor,
        strokeWidth,
        filled,
        confidence: triangleResult.confidence
      }
    }

    // 默认为曲线
    return {
      id: generateId(),
      type: 'curve',
      points: smoothed,
      strokeColor,
      fillColor,
      strokeWidth,
      filled,
      confidence: 0.7
    }
  }

  // 判断是否是直线
  const isLine = (points: Point[]): boolean => {
    if (points.length < 2) return false
    
    const start = points[0]
    const end = points[points.length - 1]
    let maxDistance = 0
    
    for (let i = 1; i < points.length - 1; i++) {
      const dist = pointToLineDistance(points[i], start, end)
      maxDistance = Math.max(maxDistance, dist)
    }
    
    return maxDistance < 15 // 允许15像素的偏差
  }

  // 判断是否是圆形
  const isCircle = (points: Point[]): { isCircle: boolean; points: Point[]; confidence: number } => {
    if (points.length < 8) return { isCircle: false, points: [], confidence: 0 }
    
    // 计算质心
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length
    const center = { x: centerX, y: centerY }
    
    // 计算平均半径
    const avgRadius = points.reduce((sum, p) => sum + distance(p, center), 0) / points.length
    
    // 检查所有点到中心的距离变化
    let radiusVariance = 0
    for (const point of points) {
      const radius = distance(point, center)
      radiusVariance += Math.pow(radius - avgRadius, 2)
    }
    radiusVariance = Math.sqrt(radiusVariance / points.length)
    
    // 检查起点和终点的距离
    const startEndDistance = distance(points[0], points[points.length - 1])
    const isClosedPath = startEndDistance < avgRadius * 0.3
    
    const isCircular = radiusVariance < avgRadius * 0.2 && isClosedPath
    const confidence = isCircular ? Math.max(0.6, 1 - (radiusVariance / avgRadius)) : 0
    
    return {
      isCircle: isCircular,
      points: [center, { x: center.x + avgRadius, y: center.y }],
      confidence
    }
  }

  // 判断是否是矩形
  const isRectangle = (points: Point[]): { isRectangle: boolean; points: Point[]; confidence: number } => {
    if (points.length < 8) return { isRectangle: false, points: [], confidence: 0 }
    
    // 找到边界框
    const minX = Math.min(...points.map(p => p.x))
    const maxX = Math.max(...points.map(p => p.x))
    const minY = Math.min(...points.map(p => p.y))
    const maxY = Math.max(...points.map(p => p.y))
    
    const corners = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY }
    ]
    
    // 检查路径是否接近矩形
    let totalDistance = 0
    for (const point of points) {
      const distances = corners.map(corner => distance(point, corner))
      const minDist = Math.min(...distances)
      
      // 检查点是否接近矩形边
      const distToEdges = [
        Math.abs(point.x - minX), // 左边
        Math.abs(point.x - maxX), // 右边
        Math.abs(point.y - minY), // 上边
        Math.abs(point.y - maxY)  // 下边
      ]
      const minEdgeDist = Math.min(...distToEdges)
      
      totalDistance += Math.min(minDist, minEdgeDist)
    }
    
    const avgDistance = totalDistance / points.length
    const width = maxX - minX
    const height = maxY - minY
    const isRectangular = avgDistance < Math.min(width, height) * 0.1 && width > 20 && height > 20
    
    return {
      isRectangle: isRectangular,
      points: corners,
      confidence: isRectangular ? Math.max(0.6, 1 - avgDistance / 20) : 0
    }
  }

  // 判断是否是三角形
  const isTriangle = (points: Point[]): { isTriangle: boolean; points: Point[]; confidence: number } => {
    if (points.length < 6) return { isTriangle: false, points: [], confidence: 0 }
    
    // 使用凸包算法找到主要顶点
    const convexHull = getConvexHull(points)
    
    if (convexHull.length === 3) {
      // 检查三角形的质量
      const sides = [
        distance(convexHull[0], convexHull[1]),
        distance(convexHull[1], convexHull[2]),
        distance(convexHull[2], convexHull[0])
      ]
      
      const angles = [
        angle(convexHull[2], convexHull[0], convexHull[1]),
        angle(convexHull[0], convexHull[1], convexHull[2]),
        angle(convexHull[1], convexHull[2], convexHull[0])
      ]
      
      const angleSum = angles.reduce((sum, a) => sum + a, 0)
      const isValidTriangle = Math.abs(angleSum - 180) < 20 && sides.every(s => s > 20)
      
      return {
        isTriangle: isValidTriangle,
        points: convexHull,
        confidence: isValidTriangle ? 0.8 : 0
      }
    }
    
    return { isTriangle: false, points: [], confidence: 0 }
  }

  // 简单的凸包算法
  const getConvexHull = (points: Point[]): Point[] => {
    if (points.length < 3) return points
    
    // 找到最下方的点（Y最大）
    const bottom = points.reduce((min, p) => p.y > min.y ? p : min)
    
    // 按极角排序
    const sorted = points
      .filter(p => p !== bottom)
      .sort((a, b) => {
        const angleA = Math.atan2(a.y - bottom.y, a.x - bottom.x)
        const angleB = Math.atan2(b.y - bottom.y, b.x - bottom.x)
        return angleA - angleB
      })
    
    const hull = [bottom]
    
    for (const point of sorted) {
      while (hull.length > 1) {
        const last = hull[hull.length - 1]
        const secondLast = hull[hull.length - 2]
        
        // 计算叉积判断转向
        const cross = (last.x - secondLast.x) * (point.y - secondLast.y) - 
                     (last.y - secondLast.y) * (point.x - secondLast.x)
        
        if (cross > 0) break
        hull.pop()
      }
      hull.push(point)
    }
    
    return hull
  }

  // 绘制形状
  const drawShape = (ctx: CanvasRenderingContext2D, shape: RecognizedShape) => {
    ctx.strokeStyle = shape.strokeColor
    ctx.fillStyle = shape.fillColor === '#transparent' ? 'transparent' : shape.fillColor
    ctx.lineWidth = shape.strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    switch (shape.type) {
      case 'line':
        ctx.beginPath()
        ctx.moveTo(shape.points[0].x, shape.points[0].y)
        ctx.lineTo(shape.points[1].x, shape.points[1].y)
        ctx.stroke()
        break
        
      case 'circle':
        const center = shape.points[0]
        const radius = distance(shape.points[0], shape.points[1])
        ctx.beginPath()
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI)
        if (shape.filled && shape.fillColor !== '#transparent') {
          ctx.fill()
        }
        ctx.stroke()
        break
        
      case 'rectangle':
        const minX = Math.min(...shape.points.map(p => p.x))
        const maxX = Math.max(...shape.points.map(p => p.x))
        const minY = Math.min(...shape.points.map(p => p.y))
        const maxY = Math.max(...shape.points.map(p => p.y))
        
        if (shape.filled && shape.fillColor !== '#transparent') {
          ctx.fillRect(minX, minY, maxX - minX, maxY - minY)
        }
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY)
        break
        
      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(shape.points[0].x, shape.points[0].y)
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y)
        }
        ctx.closePath()
        if (shape.filled && shape.fillColor !== '#transparent') {
          ctx.fill()
        }
        ctx.stroke()
        break
        
      case 'curve':
        if (shape.points.length > 1) {
          ctx.beginPath()
          ctx.moveTo(shape.points[0].x, shape.points[0].y)
          for (let i = 1; i < shape.points.length; i++) {
            ctx.lineTo(shape.points[i].x, shape.points[i].y)
          }
          ctx.stroke()
        }
        break
    }
  }

  // 绘制所有形状
  const drawShapes = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 绘制所有识别的形状
    recognizedShapes.forEach(shape => {
      drawShape(ctx, shape)
    })
    
    // 绘制当前路径
    if (currentPath.length > 1) {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      ctx.moveTo(currentPath[0].x, currentPath[0].y)
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y)
      }
      ctx.stroke()
    }
  }, [recognizedShapes, currentPath, strokeColor, strokeWidth])

  // 计算所有形状的边界框
  const calculateBounds = (shapes: RecognizedShape[]) => {
    if (shapes.length === 0) return null

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    shapes.forEach(shape => {
      switch (shape.type) {
        case 'line':
          shape.points.forEach(p => {
            minX = Math.min(minX, p.x)
            minY = Math.min(minY, p.y)
            maxX = Math.max(maxX, p.x)
            maxY = Math.max(maxY, p.y)
          })
          break
          
        case 'circle':
          const center = shape.points[0]
          const radius = distance(shape.points[0], shape.points[1])
          minX = Math.min(minX, center.x - radius)
          minY = Math.min(minY, center.y - radius)
          maxX = Math.max(maxX, center.x + radius)
          maxY = Math.max(maxY, center.y + radius)
          break
          
        case 'rectangle':
        case 'triangle':
        case 'curve':
          shape.points.forEach(p => {
            minX = Math.min(minX, p.x)
            minY = Math.min(minY, p.y)
            maxX = Math.max(maxX, p.x)
            maxY = Math.max(maxY, p.y)
          })
          break
      }
      
      // 考虑线宽
      const halfStroke = shape.strokeWidth / 2
      minX -= halfStroke
      minY -= halfStroke
      maxX += halfStroke
      maxY += halfStroke
    })

    return { minX, minY, maxX, maxY }
  }

  // 生成SVG代码
  const generateSVG = useCallback(() => {
    if (recognizedShapes.length === 0) return ''

    const bounds = calculateBounds(recognizedShapes)
    
    // 确定SVG尺寸和viewBox
    let svgWidth: number, svgHeight: number, viewBoxX: number, viewBoxY: number, viewBoxWidth: number, viewBoxHeight: number

    if (autoTrim && bounds) {
      // 添加一些边距
      const padding = 10
      viewBoxX = Math.max(0, bounds.minX - padding)
      viewBoxY = Math.max(0, bounds.minY - padding)
      viewBoxWidth = Math.min(canvasSize.width - viewBoxX, bounds.maxX + padding - viewBoxX)
      viewBoxHeight = Math.min(canvasSize.height - viewBoxY, bounds.maxY + padding - viewBoxY)
      
      // 设置最小尺寸
      viewBoxWidth = Math.max(viewBoxWidth, 100)
      viewBoxHeight = Math.max(viewBoxHeight, 100)
      
      svgWidth = Math.round(viewBoxWidth)
      svgHeight = Math.round(viewBoxHeight)
    } else {
      // 使用完整画布尺寸
      svgWidth = canvasSize.width
      svgHeight = canvasSize.height
      viewBoxX = 0
      viewBoxY = 0
      viewBoxWidth = canvasSize.width
      viewBoxHeight = canvasSize.height
    }

    let svgElements: string[] = []

    recognizedShapes.forEach(shape => {
      const strokeColorValue = shape.strokeColor
      const fillColorValue = shape.filled && shape.fillColor !== '#transparent' ? shape.fillColor : 'none'
      const strokeWidthValue = shape.strokeWidth

      switch (shape.type) {
        case 'line':
          svgElements.push(
            `<line x1="${shape.points[0].x.toFixed(2)}" y1="${shape.points[0].y.toFixed(2)}" x2="${shape.points[1].x.toFixed(2)}" y2="${shape.points[1].y.toFixed(2)}" stroke="${strokeColorValue}" stroke-width="${strokeWidthValue}"/>`
          )
          break
          
        case 'circle':
          const center = shape.points[0]
          const radius = distance(shape.points[0], shape.points[1])
          svgElements.push(
            `<circle cx="${center.x.toFixed(2)}" cy="${center.y.toFixed(2)}" r="${radius.toFixed(2)}" stroke="${strokeColorValue}" stroke-width="${strokeWidthValue}" fill="${fillColorValue}"/>`
          )
          break
          
        case 'rectangle':
          const minX = Math.min(...shape.points.map(p => p.x))
          const maxX = Math.max(...shape.points.map(p => p.x))
          const minY = Math.min(...shape.points.map(p => p.y))
          const maxY = Math.max(...shape.points.map(p => p.y))
          
          svgElements.push(
            `<rect x="${minX.toFixed(2)}" y="${minY.toFixed(2)}" width="${(maxX - minX).toFixed(2)}" height="${(maxY - minY).toFixed(2)}" stroke="${strokeColorValue}" stroke-width="${strokeWidthValue}" fill="${fillColorValue}"/>`
          )
          break
          
        case 'triangle':
          const points = shape.points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
          svgElements.push(
            `<polygon points="${points}" stroke="${strokeColorValue}" stroke-width="${strokeWidthValue}" fill="${fillColorValue}"/>`
          )
          break
          
        case 'curve':
          if (shape.points.length > 1) {
            const pathData = shape.points.map((point, index) => 
              `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
            ).join(' ')
            svgElements.push(
              `<path d="${pathData}" stroke="${strokeColorValue}" stroke-width="${strokeWidthValue}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
            )
          }
          break
      }
    })

    const svgCode = `<svg width="${svgWidth.toFixed(0)}" height="${svgHeight.toFixed(0)}" viewBox="${viewBoxX.toFixed(2)} ${viewBoxY.toFixed(2)} ${viewBoxWidth.toFixed(2)} ${viewBoxHeight.toFixed(2)}" xmlns="http://www.w3.org/2000/svg">
  ${svgElements.join('\n  ')}
</svg>`

    return svgCode
  }, [recognizedShapes, canvasSize, autoTrim])

  // 鼠标事件处理
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasCoordinates(event)
    setIsDrawing(true)
    setCurrentPath([point])
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const point = getCanvasCoordinates(event)
    setCurrentPath(prev => [...prev, point])
  }

  const handleMouseUp = () => {
    if (!isDrawing || currentPath.length < 3) {
      setIsDrawing(false)
      setCurrentPath([])
      return
    }
    
    setIsDrawing(false)
    
    // 识别形状
    const recognizedShape = recognizeShape(currentPath)
    setRecognizedShapes(prev => [...prev, recognizedShape])
    setLastRecognition(`识别为${getShapeTypeName(recognizedShape.type)} (置信度: ${(recognizedShape.confidence * 100).toFixed(0)}%)`)
    setCurrentPath([])
  }

  const getShapeTypeName = (type: string): string => {
    const names: Record<string, string> = {
      line: '直线',
      circle: '圆形',
      rectangle: '矩形',
      triangle: '三角形',
      curve: '曲线'
    }
    return names[type] || '未知形状'
  }

  // 清空画布
  const clearCanvas = () => {
    setRecognizedShapes([])
    setCurrentPath([])
    setLastRecognition('')
  }

  // 应用绘制的SVG
  const applySVG = () => {
    const svgCode = generateSVG()
    if (svgCode) {
      onSvgGenerated(svgCode)
    }
  }

  // 重绘画布
  useEffect(() => {
    drawShapes()
  }, [drawShapes])

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <Wand2 className="w-5 h-5 mr-2" />
          智能绘图工具
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              收起
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              展开
            </>
          )}
        </button>
      </div>

      {/* 简要说明 - 始终显示 */}
      <div className="mt-2 text-sm text-gray-600">
        {isExpanded 
          ? "在画布上绘制任意形状，系统会自动识别并修正为标准图形"
          : "点击展开使用智能绘图工具，支持自动识别和修正手绘形状"
        }
      </div>

      {isExpanded && (
        <>
          {/* 样式控制 */}
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">边框颜色</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">填充颜色</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={fillColor === '#transparent' ? '#ffffff' : fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300"
                    disabled={!filled}
                  />
                  <input
                    type="checkbox"
                    checked={filled}
                    onChange={(e) => setFilled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs text-gray-600">填充</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">线宽:</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600 w-8">{strokeWidth}px</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoTrim}
                    onChange={(e) => setAutoTrim(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">自动裁剪空白</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={clearCanvas}
                  className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  清空
                </button>

                <button
                  onClick={applySVG}
                  className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  disabled={recognizedShapes.length === 0}
                >
                  应用到编辑器
                </button>
              </div>
            </div>

            {/* 识别结果显示 */}
            {lastRecognition && (
              <div className="flex items-center space-x-2 text-sm bg-blue-50 p-2 rounded">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-blue-700">{lastRecognition}</span>
              </div>
            )}
          </div>

          {/* 绘图画布 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="border border-gray-200 bg-white rounded cursor-crosshair max-w-full h-auto"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* 使用说明 */}
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <div>• 用鼠标绘制任意形状，系统会自动识别并修正为标准图形</div>
            <div>• 支持识别：直线、圆形、矩形、三角形，其他保持为曲线</div>
            <div>• 勾选"自动裁剪空白"会移除SVG中的空白区域，仅保留有内容的部分</div>
            <div>• 绘制完成后点击"应用到编辑器"将SVG代码导入编辑器</div>
          </div>
        </>
      )}
    </div>
  )
} 