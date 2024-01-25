'use client'
import { useEffect, useRef, useState } from 'react'
import { Prisma } from '@prisma/client'

interface Props {
  images: Prisma.ImageGetPayload<{}>[]
}

const SlideImage = ({ images }: Props) => {
  const [selected, _setSelected] = useState(0)
  const count = images.length

  const selectedRef = useRef(selected)
  const setSelected = (data: number) => {
    selectedRef.current = data
    _setSelected(data)
  }

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        let setTo = selectedRef.current - 1
        if (setTo < 0) setTo = count - 1
        setSelected(setTo)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        let setTo = selectedRef.current + 1
        if (setTo >= count) setTo = 0
        setSelected(setTo)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        let setTo = selectedRef.current + 10
        if (setTo >= count) setTo = 0
        setSelected(setTo)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        let setTo = selectedRef.current - 10
        if (setTo < 0) setTo = count - 1
        setSelected(setTo)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="flex w-full h-full">
      <div className="flex flex-col gap-y-4 absolute text-slate-200 text-shadow px-8 py-4 sidebar">
        <div>
          {selected + 1} / {count}
        </div>
        {images[selected].title && <div>{images[selected].title}</div>}
        {images[selected].description && (
          <div className="whitespace-pre-wrap">
            {images[selected].description}
          </div>
        )}
        {images[selected].translation && (
          <div className="whitespace-pre-wrap">
            {images[selected].translation}
          </div>
        )}
      </div>
      <div className="flex w-full h-full justify-center bg-black">
        <img
          src={'/image/' + images[selected].hash}
          className="object-contain"
        />
      </div>
    </div>
  )
}

export default SlideImage
