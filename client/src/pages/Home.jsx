import HomeSection from "../components/HomeSection"
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const Home = () => {

    const navigate = useNavigate();
    const { admin } = useSelector(state => state.auth);

    useEffect(() => {
        if (!admin) navigate('/adminlogin')
    }, [admin, navigate])

    return(
        <HomeSection />
)}

export default Home;