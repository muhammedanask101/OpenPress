import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { registerUser, reset } from '../slices/userSlice'
import 'react-toastify/dist/ReactToastify.css'
import FallbackLoading from "./FallbackLoading"

const UserRegister = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: ''})
    const { name, email, password, password2 } = formData

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { user, isLoading, isError, isSuccess, message } = useSelector(state => state.user)

    useEffect(() => {
        if (isError) toast.error(message)
        if (isSuccess || user) navigate('/')
        dispatch(reset())
    }, [user, isError, isSuccess, message, navigate, dispatch]
    )

    const onChange = e => {
            setFormData(prevState =>     ({
                ...prevState,
                [e.target.name]: e.target.value
            }))
    }

    const onSubmit = e => {
        e.preventDefault()
        if(password !== password2){
            toast.error('Passwwords dont match')
        } else {
            const userData = { name, email, password }
            dispatch(registerUser(userData))
        }
    }

     return (
        isLoading ? <FallbackLoading /> : (
        <>
        <h1 className='text-2xl md:text-5xl font-bold text-black border-black mt-5 mb-2 p-2 text-center text-shadow-md'>User Register</h1>
        <section className="flex justify-center p-6 pb-10">
            <form onSubmit={onSubmit} className="text-[12px] md:text-sm shadow-md shadow-black rounded-lg bg-red-700 p-3 md:p-6 w-full max-w-md space-y-1 md:space-y-4">
                <div className="flex flex-col gap-2 w-full">
                    <div className="block mt-1 md:mt-2 font-bold font-google-sans text-white">
                        <label htmlFor="name">Enter Your Name:</label>
                    </div>
                    <div>
                        <input className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" type='text' id='name' name='name' value={name} onChange={onChange} required />
                    </div>
                    <div className="block mt-1 md:mt-2 font-bold font-google-sans text-white">
                        <label htmlFor="email">Enter Your Email:</label>
                    </div>
                    <div>
                        <input className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" type='email' id='email' name='email' value={email} onChange={onChange} required />
                    </div>
                    <div className="block mt-1 md:mt-2 font-bold font-google-sans text-white">
                        <label htmlFor="password">Enter Password:</label>
                    </div>
                    <div>
                        <input className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" type='password' id='password' name='password' value={password} onChange={onChange} />
                    </div>
                     <div className="block mt-1 md:mt-2 font-bold font-google-sans text-white">
                        <label htmlFor="password">Enter Password again:</label>
                    </div>
                    <div>
                        <input className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" type='password' id='password2' name='password2' value={password2} onChange={onChange} />
                    </div>
                    <div className="md:pt-2 border-black">
                        <Link className="hover:underline" to="/login">Login to an existing account ?</Link>
                    </div>
                </div>
                    <button className="flex w-full justify-center mt-2 bg-yellow-500 text-white font-semibold font-google-sans py-2 px-4 rounded-md hover:bg-sky-700 transition duration-200" type='submit'>Register</button>
            </form>
        </section>
        </>
    )

        )
}

export default UserRegister;