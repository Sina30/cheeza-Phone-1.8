import { AnimatePresence, motion } from 'framer-motion'
import React, {useEffect, useState} from 'react'
import { ArrowLeft } from 'react-bootstrap-icons'
import { useLocation } from 'react-router'
import {post} from 'jquery'
import { usePhone } from '../App'

const Settings = ({setBackground}: any) => {
    const location: any = useLocation()
    const [currentPage, setPage] = useState('main')
    const [modal, setModal] = useState('')
    const [info, setInfo]: any = useState(null)
    const {locales}: any = usePhone()

    useEffect(() => {
        post('https://phone/getPhoneInfo')
        .done(data => {
            setInfo(data)
        })
    }, [])

    const changeBg = (e: any) => {
        e.preventDefault();

        var bg = e.target.bg.value.toString()
        if (bg.match(/\.(jpeg|jpg|gif|png)$/)) {
            setBackground(e.target.bg.value)
            post('https://phone/setBackground', JSON.stringify({bg: e.target.bg.value}))
        }
    }

    const resetBg = (e: any) => {
        e.preventDefault();
        setBackground('../public/assets/background.png')
        post('https://phone/setBackground', JSON.stringify({bg: null}))
    }

    const resetPhone = (e: any) => {
        e.preventDefault();
        setModal('')
        setBackground('../public/assets/background.png')
        post('https://phone/resetPhone')
    }

    useEffect(() => {
        var inputs, index;
        inputs = document.getElementsByTagName('input');
        for (index = 0; index < inputs.length; ++index) {
            inputs[index].addEventListener('focusin', () => {
                post('https://phone/focus', JSON.stringify({toggle: true}))
            })

            inputs[index].addEventListener('focusout', () => {
                post('https://phone/focus', JSON.stringify({toggle: false}))
            })
        } 
    }, [currentPage])

    return (
        <motion.div
        initial={{scale: 0, x: location.state?.x, y: location.state?.y}}
        animate={{scale: 1, x: 0, y: 0}} 
        exit={{scale: 0, x: location.state?.x, y: location.state?.y}} 
        transition={{type: 'tween', duration: 0.3}} 
        className='settings'
        > 
            <AnimatePresence 
            initial={false} 
            exitBeforeEnter
            >
                {currentPage === 'main' && (
                    <motion.div
                    className='page' 
                    transition={{type: 'tween'}}  
                    initial={{x: -1000}} 
                    animate={{x: 0}} 
                    exit={{x: -1000}}
                    >
                        <h1>{locales.settingsHeader ? locales.settingsHeader : "Settings"}</h1>
                        <label>{locales.contactNumber ? locales.contactNumber : "Number"}</label>
                        <input defaultValue={info?.number} onClick={(e: any) => e.target.select()} readOnly />
                        <motion.button whileTap={{scale: 0.9}} onClick={() => setPage('bg')}>{locales.settingsBg ? locales.settingsBg : "Background"}</motion.button>
                        <motion.button whileTap={{scale: 0.9}} onClick={() => setModal('reset')}>{locales.settingsReset ? locales.settingsReset : "Reset Phone"}</motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence initial={false} exitBeforeEnter>
                {currentPage === 'bg' && (
                    <motion.div 
                    className='page' 
                    transition={{type: 'tween'}} 
                    initial={{x: 1000}} 
                    animate={{x: 0}} 
                    exit={{x: 1000}}
                    >
                        <header>
                            <motion.button whileTap={{scale: 0.8}} onClick={() => setPage('main')}><ArrowLeft /></motion.button> 
                            {locales.settingsBg ? locales.settingsBg : "Background"}
                        </header>
                        <form onSubmit={changeBg}>
                            <label>URL</label>
                            <input type="text" name='bg' defaultValue={info?.background} />
                            <motion.button whileTap={{scale: 0.9}} type='submit' style={{marginTop: '5px'}}>{locales.settingsBgApply ? locales.settingsBgApply : "Apply"}</motion.button>
                            <motion.button whileTap={{scale: 0.9}} type='reset' onClick={resetBg} style={{marginTop: '5px'}}>{locales.resetBtn ? locales.resetBtn : "Reset"}</motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <span id='version' style={{fontSize: '8pt', textAlign: 'center', marginTop: '10px', opacity: 0.9}}>{locales.phoneVersion && locales.phoneVersion}</span>

            <Modal visible={modal === 'reset' ? true : false} setModal={setModal}>
                <motion.button whileTap={{scale: 0.9}} onClick={resetPhone}>{locales.settingsReset ? locales.settingsReset : "Reset Phone"}</motion.button>
                <motion.button whileTap={{scale: 0.9}} onClick={() =>  setModal('')}>{locales.cancelModal ? locales.cancelModal : "Cancel"}</motion.button>
            </Modal>
        </motion.div>
    )
}

export const Modal = ({children, visible, setModal}: any) => {
    const handleBackdropClick = () => {
        setModal('')
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div 
                initial={{opacity: 0}} 
                animate={{opacity: 1}} 
                exit={{opacity: 0}} 
                onClick={handleBackdropClick}
                className="backdrop"
                >
                    <motion.div
                    initial={{y: 1000}} 
                    animate={{y: 0}} 
                    exit={{y: 1000}} 
                    onClick={e => e.stopPropagation()}
                    className="modal">
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default Settings
 