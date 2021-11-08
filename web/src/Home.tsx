import React from 'react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'; 
import 'tippy.js/animations/scale.css'
import { motion } from 'framer-motion';
import { useHistory } from 'react-router';
import { usePhone } from './App';

const Home = () => {
    return (
        <div className='home'>
            <AppDrawer />
        </div>
    )
}

const AppDrawer = () => {
    const {locales}: any = usePhone()

    return (
        <motion.div initial={{y: -100}} animate={{y: 1}} exit={{y: -100}} className="app-drawer">
            <App label={locales.phone ? locales.phone : 'Phone'} name='phone' />
            <App label={locales.messages ? locales.messages : 'Messages'} name='messages' />
            <App label={locales.contacts ? locales.contacts : 'Contacts'} name='contacts' />
            <App label={locales.twitter ? locales.twitter : 'Twatter'} name='twitter' />
            <App label={locales.camera ? locales.camera : 'Camera'} name='camera' />
            <App label={locales.gallery ? locales.gallery : 'Gallery'} name='gallery' />
            <App label={locales.settings ? locales.settings : 'Settings'} name='settings' />
        </motion.div>
    )
}

interface App {
    label: string,
    name: string
}

const App = ({label, name}: App) => {
    const history = useHistory()
    const ref: any = React.useRef()

    const openApp = (e: any, appName: any) => {
        var rect = ref.current;
        var x = rect.offsetLeft; //x position within the element.
        var y = rect.offsetTop;  //y position within the element.

        history.push({
            pathname: appName,
            state: {x: x-85, y: y-220}
        })
    }

    return (
        <Tippy content={label} duration={[150, 150]} placement='bottom' animation='scale'>
            <motion.div 
            ref={ref}
            whileTap={{ scale: 0.8 }} 
            className="app" 
            style={{backgroundImage: `url(../public/assets/apps/${name}.png)`}} 
            onClick={(e) => openApp(e, name)}
            >
                {/* <div className="notifications"><span>0</span></div> */}
            </motion.div>
        </Tippy>
    )
}

export default Home
