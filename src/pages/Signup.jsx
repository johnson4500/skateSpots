import React, {Fragment} from 'react'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import NavBar from '../components/NavBar'
import '../assets/Login.css'
import { auth } from '../firebaseconfig'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'


export default function Signup() {
    // const[name, setName] = useState()
    const[email, setEmail] = useState()
    const[password, setPassword] = useState()
    const navigate = useNavigate()

    const actionCodeSettings = {
        url: 'https://johnson4500.github.io/skateSpots/',
        handleCodeInApp: true
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredentials) => {
            console.log(userCredentials)
            sendEmailVerification(auth.currentUser, actionCodeSettings).then(() => {
                console.log('Email verification link sent!')
            })
            navigate('/')
        }).catch((error) => {
            console.log(error)
        })
    } 

    return (
        <Fragment>
            <NavBar></NavBar>
        <div>
            <div className = "container">
            <br></br> 
            <br></br> 
                <h2 id = 'topText'>Register</h2>
                <br></br>
                <form onSubmit = {handleSubmit}>
                    <br></br>
                    <div>
                        <label htmlFor = "email">
                            <strong>Email</strong>
                        </label>
                        <br></br>
                        <input
                         className = "inputFields"
                         type = "email"
                         placeholder = "Enter Email"
                         autoComplete = "off"
                         name = "email"
                         onChange = {(e) => setEmail(e.target.value)}/>
                    </div>
                    <br></br>
                    <div>
                        <label htmlFor = "email">
                        <strong>Password</strong>
                        </label>
                        <br></br>
                        <input
                        className = "inputFields"
                         type = "password"
                         placeholder = "Enter Password"
                         autoComplete = "off"
                         name = "password"
                         minlength= "6"
                         onChange = {(e) => setPassword(e.target.value)}/>
                    </div>
                    <br></br>
                    <button id = "logButt" type = "submit" className = "buttons">
                        Register
                    </button>
                </form>
                <a href = "/skateSpots/#login">
                    <button id = "regButt" className = "buttons">Already Have an Account</button>
                </a>
            </div>
        </div>
        </Fragment>
    )
}

