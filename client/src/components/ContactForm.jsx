import { useState } from "react";
import { useDispatch } from "react-redux";
import { createContact } from "../slices/contactSlice";
import { useNavigate } from "react-router-dom";

const ContactForm = () => {
    const [details, setDetails] = useState({ name: '', email: '', message: ''});
    const { name, email, message } = details;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onChange = e => {
        setDetails(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        const contactData = { name, email, message };

        try{
        await dispatch(createContact(contactData)).unwrap();
        setDetails({ name: '', email: '', message: ''});
        } catch (error) {
            console.error("Contact form creation failed: ", error);
        }
    }

    return(
        <section className="flex justify-center p-1">
            <form onSubmit={onSubmit} className="shadow-md shadow-black rounded-lg p-6 w-full max-w-md space-y-4  bg-red-700">
                <div className="flex flex-col gap-2 w-full">
                    <div className="block mt-2 text-sm font-medium font-google-sans text-shadow-md text-shadow-black text-amber-100">
                        <label htmlFor="name">Enter Your Name:</label>
                    </div>
                    <div>
                        <input className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" type="text" id="name" name="name" value={name} onChange={onChange} required />
                    </div>
                    <div className="block mt-2 text-sm font-medium font-google-sans text-shadow-md text-shadow-black text-amber-100">
                        <label htmlFor="fileurl">Enter Your Email:</label>
                    </div>
                    <div>
                        <input className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" type="email" id="email" name="email" value={email} onChange={onChange} required />
                    </div>
                    <div className="block mt-2 text-sm font-medium font-google-sans text-shadow-md text-shadow-black text-amber-100">
                        <label htmlFor="description">Enter Message:</label>
                    </div>
                    <div>
                        <textarea className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" id="message" name="message" rows="4" value={message} onChange={onChange} required />
                    </div>
                </div>
                    <button className="flex w-full justify-center mt-2 bg-yellow-500 text-white font-semibold font-google-sans py-2 px-4 rounded-md hover:bg-sky-700 transition duration-200" type='submit'>Submit</button>
            </form>
        </section>
    )
}

export default ContactForm;