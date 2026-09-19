import { useEffect } from 'react'
import logger from '../../../utils/logger'

const TRACKED_KEYS = ['w', 's', ' ', 'shift']

export default function KeyboardControls({ onInput }) {
  useEffect(() => {
    const keys = new Set()

    const update = () => {
      onInput({
        mobile: false,
        forward: keys.has('w'),
        brake: keys.has('s') || keys.has(' '),
        boost: keys.has('shift'),
      })
    }

    const normalize = (event) => {
      if (event.key === ' ') {
        return ' '
      }

      return event.key.toLowerCase()
    }

    const handleKeyDown = (event) => {
      const key = normalize(event)

      if (!TRACKED_KEYS.includes(key)) {
        return
      }

      if (!keys.has(key)) {
        logger.debug('Controls', 'Key pressed', {
          key,
        })
      }

      keys.add(key)

      event.preventDefault()
      update()
    }

    const handleKeyUp = (event) => {
      const key = normalize(event)

      if (!TRACKED_KEYS.includes(key)) {
        return
      }

      keys.delete(key)

      event.preventDefault()
      update()
    }

    const handleBlur = () => {
      keys.clear()

      onInput({
        mobile: false,
        forward: false,
        brake: false,
        boost: false,
      })
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    window.addEventListener(
      'keyup',
      handleKeyUp,
    )

    window.addEventListener(
      'blur',
      handleBlur,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      window.removeEventListener(
        'keyup',
        handleKeyUp,
      )

      window.removeEventListener(
        'blur',
        handleBlur,
      )
    }
  }, [onInput])

  return null
}

