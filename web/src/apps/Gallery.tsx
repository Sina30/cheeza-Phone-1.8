import { post } from 'jquery'
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router'
import {motion} from 'framer-motion'
import { Plus } from 'react-bootstrap-icons'
import Tippy from '@tippyjs/react'
import { usePhone } from '../App'

const Gallery = () => {
    const history = useHistory()
    const location: any = useLocation()
    const [images, setImages] = useState([])
    const {locales}: any = usePhone()

    useEffect(() => {
        post('https://phone/getImages').done(data => {
            setImages(data)
        })
    }, [])

    return (
        <motion.div         
        initial={{scale: 0, x: location.state?.x, y: location.state?.y}}
        animate={{scale: 1, x: 0, y: 0}} 
        exit={{scale: 0, x: location.state?.x, y: location.state?.y}} 
        transition={{type: 'tween', duration: 0.3}}  
        className='gallery'>
            <header>
                <h1>Gallery</h1>
                <motion.button whileTap={{scale: 0.8}} onClick={() => history.push('/camera')}><Plus /></motion.button>
            </header>
            <div className="images">
                {images && images.length > 0  ? images.map(image => (
                    <Image key={image} image={image} />
                )) : (
                    <div className="no-contacts-found">{locales.noImagesFound ? locales.noImagesFound : "No Images Found 😢"}</div>
                )}
            </div>
        </motion.div>
    )
}

const Image = ({image}: any) => {
    const [copied, setCopied] = useState(false)
    const {locales}: any = usePhone()

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

        setTimeout(() => setCopied(false), 1000)
    }

    return (
        <Tippy content={copied ? locales.copied ? locales.copied : 'Copied' : locales.clickToCopy ? locales.clickToCopy : 'Click to Copy'} hideOnClick={false} animation='scale'>
            <motion.img src={image} onClick={copy} />   
        </Tippy>
    )
}

export default Gallery
