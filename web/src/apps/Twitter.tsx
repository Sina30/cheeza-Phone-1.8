import React, { useEffect, useState } from 'react'
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion'
import { useHistory, useLocation } from 'react-router'
import { ArrowLeft, CameraFill, HeartFill, PersonPlusFill, PlusLg, TrashFill } from 'react-bootstrap-icons'
import Tippy from '@tippyjs/react'
import { useNuiEvent } from 'fivem-nui-react-lib'
import {post} from 'jquery'
import { usePhone } from '../App'

interface account {
    username: string,
    image: string,
    notifications?: any
}

interface tweet {
    id: number,
    account: account,
    tweet: string,
    date: number,
    likes: any,
    currAccount?: account | null
}

const Twitter = () => {
    const history = useHistory()
    const location: any = useLocation()
    const [page, setPage] = useState('');
    const [account, setAccount] = useState<account | null>(null)
    const [tweets, setTweets] = useState<Array<tweet> | null>(null)
    const [tweetModal, setTweetModal] = useState(false)
    const {locales}: any = usePhone()
    useNuiEvent('twitter', 'setTweets', setTweets)
    useNuiEvent('twitter', 'setAccount', setAccount)

    useEffect(() => {
        post(`https://phone/getTweets`).done((data) => {
            setAccount(data.account)
            setTweets(data.tweets)
        })
    }, [])

    useEffect(() => {
        var inputs, index;
        inputs = document.querySelectorAll('input,textarea');
        for (index = 0; index < inputs.length; ++index) {
            inputs[index].addEventListener('focusin', () => {
                post('https://phone/focus', JSON.stringify({toggle: true}))
            })

            inputs[index].addEventListener('focusout', () => {
                post('https://phone/focus', JSON.stringify({toggle: false}))
            })
        } 
    }, [page, tweetModal])

    const CreateAccount = (e: any) => {
        e.preventDefault();

        var image = e.target?.image.value
        if (!image) {
            image = 'https://twirpz.files.wordpress.com/2015/06/twitter-avi-gender-balanced-figure.png?w=640'
        }

        post(`https://phone/createAccount`, JSON.stringify({name: e.target?.username.value, image: image})).done(data => {
            if (data) {
                setPage('')
                setAccount(data)
            }
        })
    }

    const DeleteAccount = (e: any) => {
        e.preventDefault();
        setPage('')

        post(`https://phone/deleteAccount`)
        .done(data => {
            setPage('')
            setAccount(data)
        })
    }

    const ToggleNotifications = (e:any) => {
        post(`https://phone/toggleNotifications`)
    }

    const SendTweet = (e: any) => {
        e.preventDefault();
        post(`https://phone/sendTweet`, JSON.stringify({tweet: e.target.msg.value}))
        e.target.reset();
        setTweetModal(false)
    }

    return (
        <motion.div
        initial={{scale: 0, x: location.state?.x, y: location.state?.y}}
        animate={{scale: 1, x: 0, y: 0}} 
        exit={{scale: 0, x: location.state?.x, y: location.state?.y}} 
        transition={{type: 'tween', duration: 0.3}} 
        className='twitter'
        >
            <AnimatePresence initial={false}>
                {page === '' && (
                    <motion.div 
                    initial={{x: -1000}} 
                    animate={{x: 0}} 
                    exit={{x: -1000}}
                    transition={{type: 'tween'}} 
                    className="page"
                    >
                        <header>
                            <div className='top'>
                                <div className="logo">{locales.twitterHeader ? locales.twitterHeader : "Twatter"}</div>
                                {account ? (
                                    <motion.div 
                                    whileTap={{scale: 0.8}}
                                    style={{backgroundImage: `url(${account.image})`}} 
                                    className='account' 
                                    onClick={() => setPage('account')}
                                    />
                                ) : (
                                    <motion.div 
                                    whileTap={{scale: 0.8}}
                                    className='account-null' 
                                    onClick={() => setPage('account')}
                                    ><PersonPlusFill /></motion.div>
                                )}
                            </div>
                            {/* <input type="text" placeholder='search twitter...' /> */}
                        </header>
                        <main>
                            <div id="tweets">
                                {tweets && tweets.length > 0 ? (
                                    tweets.map((tweet, index) => <Tweet key={index} id={index} likes={tweet.likes} tweet={tweet.tweet} account={tweet.account} date={tweet.date} currAccount={account} />)
                                ) : (
                                    <div className="no-contacts-found">{locales.noTweetsFound ? locales.noTweetsFound : "No Twats Found 😢"}</div>
                                )}
                            </div>

                            <AnimateSharedLayout type="crossfade">
                                {account && (
                                    <motion.div whileTap={{scale: 1}} layoutId='tweet' onClick={() => setTweetModal(true)} whileHover={{scale: 1.2}} className="send"><PlusLg /></motion.div>
                                )}

                                <AnimatePresence exitBeforeEnter>
                                    {tweetModal && (
                                        <>
                                        <div className="overlay" onClick={() => setTweetModal(false)} />
                                        <motion.div layoutId='tweet' className='tweet-modal'>
                                            <form onSubmit={SendTweet}>
                                                <textarea placeholder={locales.enterTweet ? locales.enterTweet : "enter twat..."} name='msg' maxLength={200} minLength={5} required />
                                                <motion.button 
                                                whileTap={{scale: 0.8}} 
                                                type='button'
                                                className='i' 
                                                onClick={() => history.push({pathname: '/camera', state: {comingFromApp: 'twitter'}})}
                                                ><CameraFill /></motion.button>
                                                <motion.button type='submit' whileTap={{scale: 0.8}}>{locales.tweetBtn ? locales.tweetBtn : "Twat"}</motion.button>
                                            </form>   
                                        </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>                
                            </AnimateSharedLayout>
                        </main>
                        <footer></footer>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {page === 'account' && (
                    <motion.div 
                    initial={{x: 1000}} 
                    animate={{x: 0}} 
                    exit={{x: 1000}}
                    transition={{type: 'tween'}} 
                    className="page"
                    id='account'
                    >
                        <header>
                            <motion.button whileTap={{scale: 0.8}} onClick={() => setPage('')}><ArrowLeft /></motion.button>
                            <div>{account ? locales.twitterAccount ? locales.twitterAccount : "Account" : locales.twitterAccountCreate ? locales.twitterAccountCreate : "Create Account"}</div>
                        </header>
                        {account ? (
                            <main>
                                <form onSubmit={DeleteAccount}>
                                    <label>{locales.username ? locales.username : "Username"}</label>
                                    <input type="text" defaultValue={account.username} disabled />
                                    <label>{locales.profileImage ? locales.profileImage : "Profile Image"}</label>
                                    <input type="text" defaultValue={account.image} disabled />
                                    <div className="buttons">
                                        <motion.button type='submit' whileTap={{scale: 0.8}}>{locales.twitterDeleteAccount ? locales.twitterDeleteAccount : "Delete"}</motion.button>
                                        <motion.button type='button' onClick={ToggleNotifications} style={{background: account.notifications && 'cornflowerblue'}} whileTap={{scale: 0.8}}>{locales.toggleNotifications ? locales.toggleNotifications : "Toggle Notifications"}</motion.button>
                                    </div>
                                </form>
                            </main>
                        ) : (
                            <main>
                                <form onSubmit={CreateAccount}>
                                    <label>{locales.username ? locales.username : "Username"}</label>
                                    <input type="text" name='username' required />
                                    <label>{locales.profileimage ? locales.profileImage : "Profile Image"}</label>
                                    <input type="text" name='image' />
                                    <div className="buttons">
                                        <motion.button whileTap={{scale: 0.8}}>{locales.twitterAccountCreate ? locales.twitterAccountCreate : "Create"}</motion.button>
                                    </div>
                                </form>
                            </main>
                        )}
                        <footer></footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

const Tweet = ({id, tweet, account, likes, currAccount, date}: tweet) => {
    var dater = new Date(date * 1000)
    const {locales}: any = usePhone()

    const DeleteTweet = () => {
        post(`https://phone/deleteTweet`, JSON.stringify({tweet: id}))
    }

    const LikeTweet = () => {
        post(`https://phone/likeTweet`, JSON.stringify({tweet: id}))
    }

    const msgstring = tweet;
    const imageRegex = /(?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)(?:\?\S+=\S*(?:&\S+=\S*)*)?/g;
    const result = msgstring.replace(imageRegex, '<img src="$&" />');

    return (
        <div className="tweet">
            <div className="author">
                <div>
                    <div className='account' style={{backgroundImage: `url(${account.image})`}}  />
                    @{account.username}
                </div>
                <span>{dater.toLocaleTimeString()}</span>
            </div>
            <div className="msg" dangerouslySetInnerHTML={{__html: result}} />
            {currAccount && (
            <div className="actions">
            {/* <Tippy content='Reply' placement='bottom' animation='scale'>
                <motion.button whileTap={{scale: 0.8}}><ReplyFill /></motion.button>
            </Tippy> */}
            <Tippy content={locales.likeTweet ? locales.likeTweet : "Like"}  placement='bottom' animation='scale'>
            <motion.button onClick={LikeTweet} style={{color:'palevioletred'}} whileTap={{scale: 0.8}}><span style={{marginRight: '3px'}}>{likes.length}</span><HeartFill /></motion.button>
            </Tippy>
            {currAccount?.username === account.username && (
            <Tippy content={locales.contactDelete ? locales.contactDelete : "Delete"} placement='bottom' animation='scale'>
            <motion.button onClick={DeleteTweet} style={{color:'#ED4245'}} whileTap={{scale: 0.8}}><TrashFill /></motion.button>
            </Tippy>
            )}
            </div>
            )}
        </div>
    )
}

export default Twitter
