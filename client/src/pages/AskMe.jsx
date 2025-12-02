import ContactForm from "../components/ContactForm";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export default function Contact() {

    const navigate = useNavigate();
    const { user } = useSelector(state => state.users);

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    return (
        <section className='heading'>
           <h1 className="text-3xl font-bold text-black mb-3 p-2 mt-2 text-center text-shadow-md text-border-black">Contact me</h1>
           <ContactForm />
        </section>
)
}