import React from 'react'
import Countdown from 'react-countdown'

export default function Timer({ now, end, onComplete }) {
  return (
    <Countdown date={end} now={() => now ? new Date(now.getTime() + (Date.now() - now.getTime())) : Date.now()} onComplete={onComplete} />
  )
}
