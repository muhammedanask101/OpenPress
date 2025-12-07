import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const Home = () => {

    const navigate = useNavigate();
    const { user } = useSelector(state => state.user);

    useEffect(() => {
        if (user) navigate('/home')
    }, [user, navigate])

    return(
        <div className="justify-items-start m-2 lg:m-5 space-y-3 md:space-y-4 lg:space-y-6">
            <div className="">
                <h1 className="text-xl text-red-700 md:text-2xl lg:text-4xl font-serif font-semibold">Hi, Welcome to our <span className="text-yellow-500">Islamic community center!</span></h1>
            </div>
            <div className="hidden md:block">
                <p className="font-google-sans md:text-xl text-blue-600 lg:text-2xl">The platform is still under construction ^^</p>
            </div>
            <div className="block md:hidden">
                <p className="font-google-sans text-blue-600 text-lg">This platform is under construction ^^</p>
            </div>
        </div>
)}

export default Home;