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
    <section className="w-full max-w-lg">
      <form
        onSubmit={onSubmit}
        className="
          bg-white
          rounded-xl
          shadow-md
          border
          border-gray-200
          overflow-hidden
        "
      >
        {/* Accent bar */}
        <div className="h-1.5 bg-red-800" />

        <div className="p-6 md:p-8 space-y-5">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-serif font-bold text-red-800">
              Create account
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Join the OpenPress Community
            </p>
          </div>

          <div className="border-t pt-4 space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                required
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-md
                  border
                  focus:outline-none
                  focus:ring-2
                  focus:ring-yellow-500
                "
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-md
                  border
                  focus:outline-none
                  focus:ring-2
                  focus:ring-yellow-500
                "
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-md
                  border
                  focus:outline-none
                  focus:ring-2
                  focus:ring-yellow-500
                "
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                name="password2"
                value={password2}
                onChange={onChange}
                required
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-md
                  border
                  focus:outline-none
                  focus:ring-2
                  focus:ring-yellow-500
                "
              />
            </div>

            {/* Helper link */}
            <div className="flex justify-between text-sm">
              <Link to="/login" className="text-yellow-600 hover:underline">
                Already have an account?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="
                w-full
                py-2.5
                rounded-md
                bg-yellow-500
                text-white
                font-medium
                hover:bg-yellow-600
                transition
              "
            >
              Create account
            </button>
          </div>

          {/* Footer */}
          <div className="pt-3 text-xs text-gray-500">
            By creating an account, you agree to follow community guidelines.
          </div>
        </div>
      </form>
    </section>
  )
);

}

export default UserRegister;