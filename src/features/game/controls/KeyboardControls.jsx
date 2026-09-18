import { useEffect } from 'react'
import logger from '../../../utils/logger'

const TRACKED_KEYS = ['s', ' ', 'shift']

export default function KeyboardControls({ onInput }) {
  useEffect(() => {
    const keys = new Set()

    const update = () => {
      onInput({
        mobile: false,
        brake: keys.has('s') || keys.has(' '),
        boost: keys.has('shift'),
      })
    }

    const normalize = (event) => (event.key === ' ' ? ' ' : event.key.toLowerCase())

    const handleKeyDown = (event) => {
      const key = normalize(event)
      if (!TRACKED_KEYS.includes(key)) return

      if (!keys.has(key)) {
        logger.debug('Controls', 'Key pressed', { key })
      }

      keys.add(key)
      event.preventDefault()
      update()
    }

    const handleKeyUp = (event) => {
      const key = normalize(event)
      if (!TRACKED_KEYS.includes(key)) return

      keys.delete(key)
      update()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onInput])

  return null
}
