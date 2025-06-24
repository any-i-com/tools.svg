'use client'

import React, { useState } from 'react'
import { Circle, Square, Triangle, Star, Hexagon } from 'lucide-react'

interface SVGShapeGeneratorProps {
  onShapeGenerated: (svg: string) => void
}

export default function SVGShapeGenerator({ onShapeGenerated }: SVGShapeGeneratorProps) {
  const [selectedShape, setSelectedShape] = useState<string>('circle')
  const [size, setSize] = useState<number>(100)
  const [color, setColor] = useState<string>('#4f46e5')
  const [strokeColor, setStrokeColor] = useState<string>('#1e1b4b')
  const [strokeWidth, setStrokeWidth] = useState<number>(2)

  const generateShape = () => {
    const centerX = size / 2
    const centerY = size / 2
    
    let shapeElement = ''
    
    switch (selectedShape) {
      case 'circle':
        shapeElement = `<circle cx="${centerX}" cy="${centerY}" r="${size / 2 - strokeWidth}" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        break
      case 'square':
        shapeElement = `<rect x="${strokeWidth}" y="${strokeWidth}" width="${size - strokeWidth * 2}" height="${size - strokeWidth * 2}" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        break
      case 'triangle':
        const points = `${centerX},${strokeWidth} ${strokeWidth},${size - strokeWidth} ${size - strokeWidth},${size - strokeWidth}`
        shapeElement = `<polygon points="${points}" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        break
      case 'star':
        const starPoints = generateStarPoints(centerX, centerY, 5, size / 2 - strokeWidth, size / 4)
        shapeElement = `<polygon points="${starPoints}" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        break
      case 'hexagon':
        const hexPoints = generateHexagonPoints(centerX, centerY, size / 2 - strokeWidth)
        shapeElement = `<polygon points="${hexPoints}" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`
        break
    }

    const svgCode = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${shapeElement}
</svg>`

    onShapeGenerated(svgCode)
  }

  const generateStarPoints = (centerX: number, centerY: number, spikes: number, outerRadius: number, innerRadius: number) => {
    const points = []
    const step = Math.PI / spikes
    
    for (let i = 0; i < 2 * spikes; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = i * step - Math.PI / 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      points.push(`${x},${y}`)
    }
    
    return points.join(' ')
  }

  const generateHexagonPoints = (centerX: number, centerY: number, radius: number) => {
    const points = []
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      points.push(`${x},${y}`)
    }
    return points.join(' ')
  }

  const shapes = [
    { id: 'circle', name: '圆形', icon: Circle },
    { id: 'square', name: '方形', icon: Square },
    { id: 'triangle', name: '三角形', icon: Triangle },
    { id: 'star', name: '星形', icon: Star },
    { id: 'hexagon', name: '六边形', icon: Hexagon },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-semibold text-gray-800 mb-4">形状生成器</h3>
      
      {/* 形状选择 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">选择形状</label>
        <div className="grid grid-cols-5 gap-2">
          {shapes.map((shape) => {
            const IconComponent = shape.icon
            return (
              <button
                key={shape.id}
                onClick={() => setSelectedShape(shape.id)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  selectedShape === shape.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs">{shape.name}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 参数设置 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">大小</label>
          <input
            type="range"
            min="50"
            max="300"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">{size}px</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">边框宽度</label>
          <input
            type="range"
            min="0"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">{strokeWidth}px</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">填充颜色</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 rounded border border-gray-300"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">边框颜色</label>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-full h-10 rounded border border-gray-300"
          />
        </div>
      </div>

      <button
        onClick={generateShape}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        生成形状
      </button>
    </div>
  )
} 