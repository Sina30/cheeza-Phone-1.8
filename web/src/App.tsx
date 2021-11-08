import React, { useEffect, useState } from 'react'
import { Switch, Route, useHistory, useLocation } from 'react-router-dom'
import { BatteryHalf, Check, Reception3, XCircle } from 'react-bootstrap-icons'
import Home from './Home'
import { AnimatePresence, motion } from 'framer-motion'
import { useNuiEvent } from "fivem-nui-react-lib";
import Phone from './apps/Phone'
import Messages from './apps/Messages'
import Contacts from './apps/Contacts'
import Twitter from './apps/Twitter'
import Settings from './apps/Settings'
import { hideAll } from 'tippy.js'
import { post } from 'jquery'
import Camera from './apps/Camera'
import Gallery from './apps/Gallery'
import { Slide, toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
//@ts-ignore
import Sound from 'react-sound'

interface notification {
    app: string,
    title: string,
    msg: string,    
    data?: any,
    closeToast?: any
}

const PhoneContext = React.createContext([])

export const usePhone = () => {
    return React.useContext(PhoneContext)
}

const App = () => {
    const [open, setOpen] = useState(false)
    const [half, setHalf] = useState(false)
    const [background, setBackground] = useState('../public/assets/background.png')
    const [time, setTime] = useState(null)

    const [toasts,setToasts] = useState(0)
    const [locales, setLocales]: any = useState([])

    useNuiEvent('phone', 'open', (data: any)  => {
        if (data) {
            if (data.background) setBackground(data.background)
            setHalf(false)
            setOpen(true)    
        } else {
            closeUi()
        }
    })
    useNuiEvent('phone', 'setTime', setTime)

    const location = useLocation()
    const history = useHistory()

    document.onkeydown = (e) => {
        if (e.key === 'Escape') {
            post('https://phone/close')
            closeUi()
        }
    } 

    useEffect(() => {
        fetch("../locales.json")
        .then(response => response.json())
        .then(json => setLocales(json));
    }, [])


    const closeUi = () => {
        hideAll();

        if (location.pathname === '/camera') {
            history.push('/')
        }

        if (toasts > 0) {
            setHalf(true)
        } else {
            setOpen(false)
        }
    }

    useNuiEvent('phone', 'notify', (data: notification) => {
        var open;
        var half;

        setOpen(v => {
            open = v; 
            return v
        })

        setHalf(v => {
            half = v; 
            return v
        })

        if (!half && !open) {
            setHalf(true)
        }

        setOpen(true)

        notify(data);
    })

    useNuiEvent('phone', 'clearAllNotify', () => {
        toast.dismiss();
    })

    const notify = ({app, title, msg, data}: notification) => {
        toast(({closeToast}) => <Notification closeToast={closeToast} app={app} title={title} msg={msg} data={data} />, 
        {
            delay: 0,
            autoClose: app === 'phone' ? false : data.timeout ? data.timeout : 5000,
            onOpen: () => setToasts(toasts => toasts+1), 
            onClose: () => {
                var half: boolean;

                setHalf(v => {
                    half = v
                    return v
                })

                setToasts(toasts => {
                    var n = toasts-1
                    if (n < 1) {
                        if (half) {
                            setOpen(false)
                        }
                    }
                    return n
                })
            },
        })
    }

    const context: any = {locales, notify}

    return (
        <PhoneContext.Provider value={context}>
            <div className='app'>
                <AnimatePresence initial={false} exitBeforeEnter>
                    <motion.div initial={{y: 1000}} animate={{y: open ? half ? 500 : 0 : 1000}} exit={{y: 1000}} className='phone'>
                        <div className="case" />

                        <div className="screen" style={{backgroundImage: `url(${background})`}}>
                            <Header time={time} />

                            <ToastContainer position='top-center' closeOnClick={false} draggable={false} newestOnTop transition={Slide} limit={2} hideProgressBar theme='dark' closeButton={false} pauseOnFocusLoss={false} />

                            <Switch>
                                <Route exact path='/' component={Home} /> 
                                <Route exact path='/phone' component={Phone} /> 
                                <Route exact path='/messages' component={Messages} /> 
                                <Route exact path='/contacts' component={Contacts} /> 
                                <Route exact path='/twitter' component={Twitter} /> 
                                <Route exact path='/camera' component={Camera} /> 
                                <Route exact path='/gallery' component={Gallery} /> 
                                <Route exact path='/settings' render={() => <Settings setBackground={setBackground} />} /> 
                            </Switch>

                            <AnimatePresence initial={false}>
                                {location.pathname !== '/' && (
                                    <motion.div className='home-btn' initial={{y: 100}} animate={{y: 1}} transition={{delay: 0.15}} exit={{y: 100, transition: {delay: 0}}}>
                                        <motion.div whileHover={{ scale: 1.3}} whileTap={{ scale: 1 }} onClick={() => history.push('/')} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </PhoneContext.Provider>
    )
}

const Header = ({time}: any) => {
    return (
        <div className="header">
            {time && (
                <div className="time">{time.hour}:{time.min}</div>
            )}
            <div className="icons">
                <Reception3 />
                <BatteryHalf />
            </div>
        </div>
    )
}

const Notification = ({closeToast, title, app, msg, data}: notification) => {
    const history = useHistory()
    const [status, setStatus] = useState<string | null>(null)
    const [onCall, setCall] = useState(false)
    const [finished, setFinished] = useState(false)

    useEffect(() => {
        if (app === 'phone') {
            setStatus(data.caller ? 'Calling...' : 'Incoming Call...')
        } else {
            let aud = new Audio(`../public/assets/${data?.sound}`)
            aud.play()
        }
    }, [])

    useNuiEvent('phone', 'answerCall', () => {
        setCall(true)
        setStatus('Connected.')
    })

    useNuiEvent('phone', 'declineCall', () => {
        setCall(false)
        setFinished(true)
        setStatus('Disconnected.')
        setTimeout(() => {
            closeToast()
        }, 1000)
    })
    
    const handleClick = () => {
        if (app === 'phone') return;

        if (data.dispatch) {
            if (data.coords) {
                post('https://phone/setWaypoint', JSON.stringify({coords: data.coords}))
            }
            
            closeToast()
            return
        }

        closeToast()
        history.push({pathname: `/${app}`, state: data ? data : {}})
    }
    

    const answerCall = () => {
        post('https://phone/answerCall', JSON.stringify({number: data?.number}))
    }
    
    const declineCall = () => {
        post('https://phone/declineCall', JSON.stringify({number: data?.number}))
    }

    return (
        <div className='notification' onClick={handleClick}>
            {app === 'phone' && (
                !data?.caller ? (
                    <Sound url='../public/assets/ringtone.mp3' playStatus={finished ? Sound.status.STOPPED : !onCall ? Sound.status.PLAYING : Sound.status.STOPPED} loop={true} volume={10} />
                ) : (
                    <Sound url='../public/assets/outgoing.mp3' playStatus={finished ? Sound.status.STOPPED : !onCall ? Sound.status.PLAYING : Sound.status.STOPPED} loop={true} volume={5} /> 
                )
            )}
            <div className='head'>
                <img src={`../public/assets/apps/${app}.png`} />
                <div className="title">{title}</div>
            </div>
            <div className="msg">
                {status && app === 'phone' ? (
                    <>
                        {status}
                        <div className="actions">
                            <motion.div className="decline" onClick={declineCall} whileTap={{scale: 0.8}}><XCircle /></motion.div>
                            {!data.caller && !onCall && !finished && <motion.div className="accept" whileTap={{scale: 0.8}} onClick={answerCall}><Check /></motion.div>}
                        </div>
                    </>
                ) : msg}
            </div>
        </div>
    )
}

export default App
