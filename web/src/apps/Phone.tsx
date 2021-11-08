import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useHistory, useLocation } from 'react-router'
import { BackspaceFill, TelephoneFill } from 'react-bootstrap-icons'
import {post} from 'jquery'

const Phone = () => {
    const history = useHistory()
    const location: any = useLocation()
    const [number, setNumber] = useState('')
    const numbers = []
    
    const addNumber = (num: number) => {
        if (number.length < 11) {
            setNumber(nums => nums+=num)
        }
    }

    const call = () => {
        if (number.length > 0) {
            history.push('/')
            post('https://phone/attemptCall', JSON.stringify({number: number}))
        }
    }

    const removeNumber = () => {
        setNumber(nums => nums.substring(0, nums.length-1))
    }

    for (var i = 1; i <= 9; i++) {
        numbers.push(<Number key={i} val={i} add={addNumber} />)
    }
    
    numbers.push(<motion.div key={'del'} whileTap={{scale: 0.9}} className='number' id='delete' onClick={removeNumber}><BackspaceFill /></motion.div>)
    numbers.push(<Number key={0} val={0} add={addNumber} />)
    numbers.push(<motion.div key={'call'} onClick={call} whileTap={{scale: 0.9}} className='number' id='call'><TelephoneFill /></motion.div>)

    return (
        <motion.div
        initial={{scale: 0, x: location.state?.x, y: location.state?.y}}
        animate={{scale: 1, x: 0, y: 0}} 
        exit={{scale: 0, x: location.state?.x, y: location.state?.y}} 
        transition={{type: 'tween', duration: 0.3}} 
        className='phone-app'
        >
            <div className="info">
                <span>{number}</span>
            </div>
            <div className="dialer">
                {numbers}
            </div>
        </motion.div>
    )
}

const Number = ({val, add}: any) => {
    return (
        <motion.div key={val} className="number" whileTap={{scale: 0.9}} onClick={() => add(val)}>{val}</motion.div>
    )
}

export default Phone
