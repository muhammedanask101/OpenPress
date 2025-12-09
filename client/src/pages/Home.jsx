import HomeSection from "../components/HomeSection"
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const Home = () => {

    const navigate = useNavigate();
    const { user } = useSelector(state => state.user);

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    return(
        <HomeSection />
)}

export default Home;