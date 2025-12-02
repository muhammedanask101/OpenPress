import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { login, reset } from '../slices/authSlice'
import { userLogin } from '../slices/userSlice'
import FallbackLoading from "./FallbackLoading"

const AdminSignIn = () => {
    const [formData, setFormData] = useState({ email: '', password: ''})
    const { email, password } = formData
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { admin, isLoading, isError, isSuccess, message } = useSelector(state => state.auth)

    useEffect(() => {
        if (isError) toast.error(message)
        if (isSuccess || admin) navigate('/admin')
        dispatch(reset())
     }, [admin, isError, isSuccess, message, navigate, dispatch])

    const onChange = e => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }

    const onSubmit = (e) => {
        e.preventDefault();
        const adminData = { email, password }
        dispatch(login(adminData)).unwrap().then(
            () => {
                navigate("/admin");
            }
        ).catch(err => {
            console.error(err);
        })
        dispatch(userLogin(adminData)).unwrap().catch(err => {
            console.error(err);
        })
}

    return (
        isLoading ? <FallbackLoading /> : (
        <>
        <h1 className='text-2xl md:text-5xl font-bold text-black border-black mt-5 mb-2 p-2 text-center text-shadow-md'>Admin Login</h1>
        <section className="flex justify-center p-6">
            <form onSubmit={onSubmit} className="text-[12px] md:text-sm shadow-md shadow-black rounded-lg bg-red-700 p-3 md:p-6 w-full max-w-md space-y-1 md:space-y-4">
                <div className="flex flex-col gap-2 w-full">
                    <div className="block mt-1 md:mt-2 font-medium font-google-sans text-shadow-md text-shadow-black text-amber-100">
                        <label htmlFor="email">Enter Your Email:</label>
                    </div>
                    <div>
                        <input className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" type='email' id='email' name='email' value={email} onChange={onChange} required />
                    </div>
                    <div className="block mt-1 md:mt-2 font-medium font-google-sans text-shadow-md text-shadow-black text-amber-100">
                        <label htmlFor="password">Enter Password:</label>
                    </div>
                    <div>
                        <input className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" type='password' id='password' name='password' value={password} onChange={onChange} />
                    </div>
                </div>
                    <button className="flex w-full justify-center mt-2 bg-sky-600 text-white font-semibold font-google-sans py-2 px-4 rounded-md hover:bg-sky-700 transition duration-200" type='submit'>Add</button>
            </form>
        </section>
        </>
    )

        )
}

export default AdminSignIn;