import React, { useEffect, useState } from 'react'
import {motion} from 'framer-motion'
import { useHistory, useLocation } from 'react-router'
import { ArrowCounterclockwise, CameraFill, CheckLg, ClipboardPlus, ImageFill, Save2 } from 'react-bootstrap-icons'
import Tippy from '@tippyjs/react'
import { post } from 'jquery'
import { usePhone } from '../App'

const Camera = () => {
    const history = useHistory()
    const location: any = useLocation()
    const [image, setImage]: any = useState(null)
    const [added, setAdded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const {locales}: any = usePhone()

    useEffect(() => {
        post('https://phone/openCamera')
        return () => {
            post('https://phone/closeCamera')
        }
    }, [])

    const switchCam = () => {
        post('https://phone/switchCam')
    }

    const takePic = () => {
        setLoading(true)
        post('https://phone/takePic').done(pic => {
            setAdded(false)
            setLoading(false)
            setImage(pic)
        })
    }

    const sendImageToApp = () => {
        copy();
        history.push({pathname: `/${location.state?.comingFromApp}`, state: {image: image, data: location.state?.data}})
    }

    const copy = () => {
        var node = document.createElement('textarea');
        var selection = document.getSelection();
  
        node.textContent = image;
        document.body.appendChild(node);
  
        selection?.removeAllRanges();
        node.select();
        document.execCommand('copy');
  
        selection?.removeAllRanges();
        document.body.removeChild(node);
        setCopied(true)

        setTimeout(() => {
            setCopied(false)
        }, 1000)
    }

    const save = () => {
        setAdded(true)
        post('https://phone/addImageToGallery', JSON.stringify({image: image}))
    }

    document.onkeydown = function(e) {
        if (image) return

        if (e.key === 'e') {
            setLoading(true)
            post('https://phone/takePic').done(pic => {
                setAdded(false)
                setLoading(false)
                setImage(pic)
            })
        } else if (e.key === 'r') {
            post('https://phone/switchCam')
        }
    }

    return (
        <motion.div 
        initial={{scale: 0, x: location.state?.x, y: location.state?.y}}
        animate={{scale: 1, x: 0, y: 0}} 
        exit={{scale: 0, x: location.state?.x, y: location.state?.y}} 
        transition={{type: 'tween', duration: 0.3}} 
        className='camera'>
            <header>
                <h1>Camera</h1>
            </header>
            {image ? (
                <>
                    <motion.img layoutId='image' src={image}/>
                    <div className="cam-group">
                        <Tippy content={locales.retakePic ? locales.retakePic : `Retake`} animation='scale'>
                            <motion.button whileTap={{scale: 0.8}} className="btn" onClick={() => setImage(null)}><ArrowCounterclockwise /></motion.button>
                        </Tippy>
                        <Tippy content={locales.savePic ? locales.savePic : `Save to Gallery`} animation='scale'>
                            <motion.button whileTap={{scale: 0.8}} className="btn" onClick={save} disabled={added}><Save2 /></motion.button>
                        </Tippy>
                        <Tippy content={locales.copyPic ? locales.copyPic : `Copy to Clipboard`} animation='scale'>
                            <motion.button whileTap={{scale: 0.8}} className="btn" onClick={copy} disabled={copied}><ClipboardPlus /></motion.button>
                        </Tippy>
                        {location.state?.comingFromApp && (
                            <Tippy content={locales.returnToAppPic ? locales.returnToAppPic : `Go back to app`} animation='scale'>
                                <motion.button whileTap={{scale: 0.8}} className="btn" onClick={sendImageToApp}><CheckLg /></motion.button>
                            </Tippy>
                        )}
                    </div>
                </>
            ) : (
                <div className="cam-group">
                    <Tippy content={!loading ? locales.takePic ? locales.takePic : `Take Picture - E` : 'Loading'} hideOnClick={false} animation='scale'>
                        <span><motion.button whileTap={{scale: 0.8}} className="btn" onClick={takePic} disabled={loading}><CameraFill /></motion.button></span>
                    </Tippy>
                    <Tippy content={locales.switchCam ? locales.switchCam : `Switch - E`} animation='scale'>
                        <motion.button whileTap={{scale: 0.8}} className="btn" onClick={switchCam}><ArrowCounterclockwise /></motion.button>
                    </Tippy>
                    <Tippy content={locales.galleryBtn ? locales.galleryBtn : `Gallery`} animation='scale'>
                        <motion.button whileTap={{scale: 0.8}} className="btn" onClick={() => history.push('/gallery')}><ImageFill /></motion.button>
                    </Tippy>
                </div>
            )}
        </motion.div>
    )
}

export default Camera
