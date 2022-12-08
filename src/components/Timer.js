import React from 'react'
import Countdown from 'react-countdown'

export default function Timer({ end, onComplete }) {
  return (
    <Countdown date={end} onComplete={onComplete} />
  )
}
