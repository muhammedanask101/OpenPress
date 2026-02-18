import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginUser, reset } from '../slices/userSlice'
import FallbackLoading from "./FallbackLoading"

const UserLogIn = () => {
    const [formData, setFormData] = useState({ email: '', password: ''})
    const { email, password } = formData
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, isLoading, isError, isSuccess, message } = useSelector(state => state.user)

    useEffect(() => {
        if (isError) toast.error(message)
        if (isSuccess || user) navigate('/')
        dispatch(reset())
     }, [user, isError, isSuccess, message, navigate, dispatch])

    const onChange = e => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }

    const onSubmit = (e) => {
        e.preventDefault();
        const userData = { email, password }
        dispatch(loginUser(userData)).unwrap().then(
            () => {
                navigate("/");
            }
        ).catch(err => {
            console.error(err);
        })
}

   return (
  isLoading ? <FallbackLoading /> : (
    <section className="w-full max-w-lg">
      <form
        onSubmit={onSubmit}
        className="
          bg-white
          rounded-xl
          shadow-lg
          border border-gray-200
          overflow-hidden
        "
      >

        {/* Top accent */}
        <div className="h-2 bg-red-800" />

        <div className="p-6 md:p-8 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-serif font-bold text-red-800">
              User Login
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              OpenPress Community
            </p>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              className="
                w-full
                px-3
                py-2.5
                rounded
                border
                bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-yellow-500
              "
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              className="
                w-full
                px-3
                py-2.5
                rounded
                border
                bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-yellow-500
              "
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between text-sm">
            <Link
              to="/register"
              className="text-yellow-600 hover:underline"
            >
              Create a new account
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="
              w-full
              py-3
              rounded
              bg-yellow-500
              text-white
              font-medium
              hover:bg-yellow-600
              transition
            "
          >
            Login
          </button>

          {/* Footer */}
          <div className="text-xs text-gray-500 pt-2">
            By signing in, you agree to follow community guidelines.
          </div>

        </div>
      </form>
    </section>
  )
);

}

export default UserLogIn;