import { render } from 'react-dom'
import React from 'react'
import { useSpring, animated } from 'react-spring'

export default function Saying() {
  const props = useSpring({
    from: { 
        position: "absolute",
        transform: "translate(-50%,-50%)",
        width: "15px",
        height: "15px",
        borderRadius: "15px",
        backgroundColor: "#4b9cdb",

        top: '0%',
        },
    to: async next => {
      while (1) {
        await next({ top: '0%'})
        await next({ top: '100%'})
        await next({ top: '0%'})
      }
    },
  })
  return <animated.div className="saying" style={props} />
}
