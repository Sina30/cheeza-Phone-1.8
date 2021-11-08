import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Plus } from 'react-bootstrap-icons'
import { Modal } from './Settings'
import {post} from 'jquery'
import { usePhone } from '../App'
import {v4} from 'uuid'

const Contacts = () => {
    const history = useHistory()
    const location: any = useLocation()
    const [contacts, setContacts]: any = useState([])
    const [contact, setContact]: any = useState('')
    const [filtered, setFiltered]: any = useState(null)
    const [page, setPage] = useState('')
    const [modal, setModal] = useState('')
    const [pNumber, setNumber]: any = useState(null)
    const [editing, setEditing] = useState<boolean | null>(false)
    const {locales}: any = usePhone()
    
    const contactName: any = React.useRef()
    const contactNumber: any = React.useRef()

    useEffect(() => {
        if (location.state?.messages) {
            post('https://phone/getContacts')
            .done(contacts => {
                setContacts(contacts)

                var found = false
                contacts.forEach((_contact: any, index: number) => {
                    if (_contact.number === location.state?.number) {
                        setContact({number: _contact.number, name: _contact.name, delete: _contact.delete, id: _contact.id})
                        found = true
                    }
                })

                if (found) {
                    setPage('contact')
                } else {
                    setNumber(location.state?.number)
                    setPage('add')
                }
            })
        } else {
            post('https://phone/getContacts')
            .done(contacts => {
                setContacts(contacts)
            })
        }
    }, [])

    useEffect(() => {
        setFiltered(null)
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
        post('https://phone/addContact', JSON.stringify({id: v4(), number: e.target.number.value, name: e.target.name.value}))
        .done(contacts => {
            setFiltered(null)
            setContacts(contacts)
            setPage('')
        })
    }

    const deleteContact = () => {
        setModal('')
        post('https://phone/deleteContact', JSON.stringify({id: contact.id}))
        .done(contacts => {
            setFiltered(null)
            setContacts(contacts)
            setPage('')
        })
    }

    const call = () => {
        post('https://phone/attemptCall', JSON.stringify({number: contact.number}))
    }

    const editContact = () => {
        setEditing(false)
        setContact({id: contact?.id, delete: contact?.delete, name: contactName.current.value, number: contactNumber.current.value})
        post('https://phone/editContact', JSON.stringify({id: contact.id, name: contactName.current.value, number: contactNumber.current.value}))
        .done(contacts => {
            setFiltered(null)
            setContacts(contacts)
        })
    }

    const cancelEdit = () => {
        contactName.current.value = contact?.name
        contactNumber.current.value = contact?.number
        setEditing(false)
    }

    const handleSearch = (e: any) => {
        const value = e.target.value.toLowerCase()
        var results = contacts.filter((data: any) => 
            data.name.toLowerCase().includes(value)
        )
        setFiltered(results)
    }

    return (
        <motion.div
        initial={{scale: 0, x: location.state?.x, y: location.state?.y}}
        animate={{scale: 1, x: 0, y: 0}} 
        exit={{scale: 0, x: location.state?.x, y: location.state?.y}} 
        transition={{type: 'tween', duration: 0.3}} 
        className='contacts'
        >
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
                            <div className='top'> 
                                <h1>Contacts</h1>
                                <motion.button whileTap={{scale: 0.8}} onClick={() => setPage('add')}><Plus /></motion.button>
                            </div>
                            <motion.input onChange={handleSearch} placeholder={locales.contactSearch ? locales.contactSearch : "search contacts..."} />
                        </header>
                        <main>
                            {contacts.length > 0 ? (
                                filtered ? (
                                    filtered.length > 0 && Object(filtered).map((contact: any, index: number) => (
                                        <Contact id={contact.id} key={v4()} name={contact.name} number={contact.number} removeAble={contact.delete} setPage={setPage} setContact={setContact} />
                                    ))
                                ) : (
                                    Object(contacts).map((contact: any, index: number) => (
                                        <Contact id={contact.id} key={v4()} name={contact.name} number={contact.number} removeAble={contact.delete} setPage={setPage} setContact={setContact} />
                                    ))
                                )
                            ) : (
                                <div className="no-contacts-found">{locales.contactNotFound ? locales.contactNotFound : 'No Contacts Found 😢'}</div>
                            )}
        
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
                {page === 'add' && (
                    <motion.div 
                    className='page'          
                    initial={{x: 1000}} 
                    animate={{x: 0}} 
                    exit={{x: 1000}}
                    transition={{type: 'tween'}} 
                    >
                        <header style={{marginBottom: '5px'}}>
                            <div className='top' style={{justifyContent: 'flex-start', gap: '10px', margin: '0'}}> 
                                <motion.button style={{fontSize: '10pt', padding: '8px'}} whileTap={{scale: 0.8}} onClick={() => setPage('')}><ArrowLeft /></motion.button>
                                <h1>{locales.contactHeader ? locales.contactHeader : 'Contact'}</h1>
                            </div>
                        </header>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>{locales.contactName ? locales.contactName : 'Name'}</label>
                                <input name='name' required />
                            </div>
                            <div>
                                <label>{locales.contactNumber ? locales.contactNumber : 'Number'}</label>
                                <input name='number' defaultValue={pNumber} required />
                            </div>
                            <div className='buttons'>
                                <motion.button type='submit' whileTap={{scale: 0.8}}>{locales.contactAdd ? locales.contactAdd : "Add"}</motion.button>
                                <motion.button type='reset' whileTap={{scale: 0.8}}>{locales.resetBtn ? locales.resetBtn : "Remove"}</motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
                {page === 'contact' && (
                    <motion.div 
                    className='page'     
                    id='contact-info'     
                    initial={{x: 1000}} 
                    animate={{x: 0}} 
                    exit={{x: 1000}}
                    transition={{type: 'tween'}} 
                    >
                        <header style={{marginBottom: '5px'}}>
                            <div className='top' style={{justifyContent: 'flex-start', gap: '10px', margin: '0'}}> 
                                {!editing && <motion.button style={{fontSize: '10pt', padding: '8px'}} whileTap={{scale: 0.8}} onClick={() => setPage('')}><ArrowLeft /></motion.button>}
                                <h1>{editing ? 'Edit Contact' : contact?.name}</h1>
                            </div>
                        </header>

                        <div style={{marginBottom: '5px'}}>
                            <label>{locales.contactName ? locales.contactName : 'Name'}</label>
                            <input defaultValue={contact?.name} ref={contactName} disabled={!editing} />
                        </div>

                        <div>
                            <label>{locales.contactNumber ? locales.contactNumber : 'Number'}</label>
                            <input defaultValue={contact?.number} ref={contactNumber} disabled={!editing} />
                        </div>
                         
                        <div className='contact-content'>
                            {editing ? (
                                <>
                                    <motion.button whileTap={{scale: 0.9}} onClick={editContact}>{locales.contactSave ? locales.contactSave : 'Save'}</motion.button>
                                    <motion.button whileTap={{scale: 0.9}} onClick={cancelEdit}>{locales.cancelModal ? locales.cancelModal : 'Cancel'}</motion.button>
                                </>
                            ) : (
                                <>
                                    <motion.button whileTap={{scale: 0.9}} onClick={call}>{locales.contactCall ? locales.contactCall : 'Call'}</motion.button>
                                    <motion.button whileTap={{scale: 0.9}} onClick={() => history.push({pathname: '/messages', state: {fromContacts: true, number: contact?.number, name: contact?.name}})}>{locales.contactMessage ? locales.contactMessage : 'Message'}</motion.button>
                                    {contact?.delete && <motion.button whileTap={{scale: 0.9}} onClick={() => setEditing(true)}>{locales.contactEdit ? locales.contactEdit : 'Edit'}</motion.button>}
                                    {contact?.delete && <motion.button whileTap={{scale: 0.9}} id='delete' onClick={() => setModal('delete')}>{locales.contactDelete ? locales.contactDelete : 'Delete'}</motion.button>}
                                </>
                            )}
 
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <Modal visible={modal === 'delete' ? true : false} setModal={setModal}>
                <motion.button whileTap={{scale: 0.9}} onClick={deleteContact}>{locales.contactDelete ? locales.contactDelete : 'Delete'}</motion.button>
                <motion.button whileTap={{scale: 0.9}} onClick={() =>  setModal('')}>{locales.cancleModal ? locales.cancelModal : 'Cancel'}</motion.button>
            </Modal>
        </motion.div>
    )
}


const Contact = ({number, name, id, removeAble, setContact, setPage}: any) => {
    const handleClick = () => {
        setContact({number, name, id, delete: removeAble})
        setPage('contact')
    }

    return (
        <motion.div whileTap={{scale: 0.9}} className="contact" onClick={handleClick}>
            <span>{name}</span>
        </motion.div>
    )
}

export default Contacts  
