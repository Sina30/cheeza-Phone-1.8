import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHistory, useLocation } from 'react-router'
import { ArrowLeft, CameraFill, GeoAltFill, PinMap, Plus } from 'react-bootstrap-icons'
import { useNuiEvent } from 'fivem-nui-react-lib'
import Tippy from '@tippyjs/react'
import {post} from 'jquery'
import { usePhone } from '../App'

const Messages = () => {
    const chatRef: any = React.useRef()
    const history = useHistory()
    const location: any = useLocation()
    const [page, setPage] = useState('')
    const [messages, setMessages]: any = useState([])
    const [chat, setChat]: any = useState([])
    const [info, setInfo]: any = useState([])
    const [coords, setCoords] = useState(false)
    const {locales}: any = usePhone()

    useNuiEvent('messages', 'setChat', ({num, chat}: any) => {
        setInfo((info: any) => {
            if (info.number === num) {
                setChat(chat)
            }
            return info
        })
        
        // @ts-ignore
        chatRef?.current?.scrollTop = chatRef?.current?.scrollHeight;
    })
    useNuiEvent('messages', 'setMessages', setMessages)

    useEffect(() => {
        if (location.state?.number) {
            setInfo(location.state)
            setPage('chat')
            post('https://phone/getChat', JSON.stringify({number: location.state?.number}))
            .done(result => {
                setChat(result)
                // @ts-ignore
                chatRef?.current?.scrollTop = chatRef?.current?.scrollHeight;
            })
        } else if (location.state?.data?.number) {
            setInfo(location.state.data)
            setPage('chat')
            post('https://phone/getChat', JSON.stringify({number: location.state?.data?.number}))
            .done(result => {
                setChat(result)
                // @ts-ignore
                chatRef?.current?.scrollTop = chatRef?.current?.scrollHeight;
            })
        } else {
            post('https://phone/getMessages')
            .done(result => {
                setMessages(result)
            })
        }
    }, [])

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
    }, [page])

    const handleSubmit = (e: any) => {
        e.preventDefault();

        post('https://phone/sendMessage', JSON.stringify({msg: e.target.msg.value, number: info.number, coords: coords}))
        .done(result => {
            setChat(result)
            // @ts-ignore
            chatRef?.current?.scrollTop = chatRef?.current?.scrollHeight;
        })

        e.target.reset();
    }

    const goBackFromChat = () => {
        setCoords(false)
        setPage('')
        post('https://phone/getMessages')
        .done(result => {
            setMessages(result)
        })
    }

    const selectMessage = (number: any, author: any) => {
        setInfo({number, name: author})
        setPage('chat')
        post('https://phone/getChat', JSON.stringify({number: number}))
        .done(result => {
            setChat(result)
            // @ts-ignore
            chatRef?.current?.scrollTop = chatRef?.current?.scrollHeight;
        })
    }

    const setWaypoint = (coords: Array<number>) => {
        post('https://phone/setWaypoint', JSON.stringify({coords: coords}))
    }

    return (
        <motion.div
        initial={{scale: 0, x: location.state?.x, y: location.state?.y}}
        animate={{scale: 1, x: 0, y: 0}} 
        exit={{scale: 0, x: location.state?.x, y: location.state?.y}} 
        transition={{type: 'tween', duration: 0.3}} 
        className='messages'>
            <AnimatePresence initial={false}>
                {page === '' && (
                    <motion.div
                    className='page' 
                    initial={{x: -1000}} 
                    animate={{x: 0}} 
                    exit={{x: -1000}}
                    transition={{type: 'tween'}}
                    >
                        <header>
                            <h1>{locales.messagesHeader ? locales.messagesHeader : "Messages"}</h1>
                            <motion.button whileTap={{scale: 0.8}} onClick={() => history.push('/contacts')}><Plus /></motion.button>
                        </header>
                        
                        <main id='messages'>
                            {messages && messages.length > 0 ? messages.map((msg: any, index: number) => {
                                return <Message key={index} author={msg.author} msg={msg.msg} number={msg.number} date={msg.date} select={selectMessage}  />
                            }) : (
                                <div className='no-contacts-found'>{locales.noMessageFound ? locales.noMessageFound : 'No Messages Found 😢'}</div>
                            )}
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
                {page === 'chat' && (
                    <motion.div 
                    className='page chat' 
                    initial={{x: 1000}} 
                    animate={{x: 0}} 
                    exit={{x: 1000}}
                    transition={{type: 'tween'}}
                    >
                        <header>
                            <motion.button whileTap={{scale: 0.8}} onClick={goBackFromChat}><ArrowLeft /></motion.button> 
                            <h1 onClick={() => history.push({pathname: '/contacts', state: {messages: true, number: info?.number}})}>{info?.name}</h1>
                        </header>

                        <main id='chat' ref={chatRef}>
                            {chat && chat?.map((msg: any, index: number) => {
                                var dater = new Date(msg.date * 1000)
                                const msgstring = msg.msg;
                                const imageRegex = /(?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)(?:\?\S+=\S*(?:&\S+=\S*)*)?/g;
                                const result = msgstring.replace(imageRegex, '<img src="$&" />');
                                return (<Tippy  key={index} content={dater.toLocaleTimeString()} hideOnClick={false} animation='scale' placement='bottom'>
                                    <div className={`message ${msg.number !== info?.number && 'me'}`}>
                                        <span dangerouslySetInnerHTML={{__html: result}} />
                                        {msg.coords && <Tippy content='Set Waypoint'><motion.button whileTap={{scale: 0.8}} onClick={() => setWaypoint(msg.coords)}><PinMap/></motion.button></Tippy>}
                                    </div>
                                </Tippy>)
                            })}
                        </main>

                        <footer>
                            <form onSubmit={handleSubmit}>
                                <motion.button 
                                type='button' 
                                whileTap={{scale: 0.8}}  
                                onClick={() => history.push({pathname: '/camera', state: {comingFromApp: 'messages', data: {number: info?.number, name: info?.name}}})}
                                ><CameraFill /></motion.button>
                                <motion.button type='button' whileTap={{scale: 0.8}} onClick={() => setCoords(!coords)} className={`${coords ? 'selected' : ''}`}><GeoAltFill /></motion.button>
                                <input name='msg' placeholder={locales.enterMessage ? locales.enterMessage : 'enter message...'}maxLength={200} required />
                            </form>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

const Message = ({msg, author, date, number, select}: any) => {
    var dater = new Date(date * 1000)

    const msgstring = msg;
    const imageRegex = /(?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)(?:\?\S+=\S*(?:&\S+=\S*)*)?/g;
    const result = msgstring.replace(imageRegex, 'Image');

    return (
        <motion.div whileTap={{scale: 0.9}} onClick={() => select(number, author)} className="message">
            <div className='info'>
                <div className="timestamp">{dater.toLocaleString()}</div>
                <div className="author">{author}</div>
                <div className="content">{result}</div>
            </div>
        </motion.div>
    )
}

export default Messages
