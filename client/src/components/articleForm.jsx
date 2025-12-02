import { useState } from "react";
import { useDispatch } from "react-redux";
import { createArticle } from "../slices/ArticleSlice";
import { useNavigate } from "react-router-dom";

const ArticleForm = () => {
    const [details, setDetails] = useState({ title: '', fileurl: '', description: ''});
    const { title, fileurl, description } = details;
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
        const articleData = { title, fileurl, description };

        try{
        await dispatch(createArticle(articleData)).unwrap();
        setDetails({ title: '', fileurl: '', description: ''});
        } catch (error) {
            console.error("Article creation failed: ", error);
        }
    }

    return(
        <section className="flex justify-center p-6">
            <form onSubmit={onSubmit} className="shadow-md shadow-black bg-red-700 rounded-lg p-6 w-full max-w-md space-y-4">
                <div className="flex flex-col gap-2 w-full">
                    <div className="block mt-2 text-sm font-medium font-google-sans text-shadow-md text-shadow-black text-amber-100">
                        <label htmlFor="title">Enter Article Title:</label>
                    </div>
                    <div>
                        <input className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" type="text" id="title" name="title" value={title} onChange={onChange} required />
                    </div>
                    <div className="block mt-2 text-sm font-medium font-google-sans text-shadow-md text-shadow-black text-amber-100">
                        <label htmlFor="fileurl">Enter URL:</label>
                    </div>
                    <div>
                        <input className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" type="url" id="fileurl" name="fileurl" value={fileurl} onChange={onChange} />
                    </div>
                    <div className="block mt-2 text-sm font-medium font-google-sans text-shadow-md text-shadow-black text-amber-100">
                        <label htmlFor="description">Enter Article Description:</label>
                    </div>
                    <div>
                        <textarea className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2 focus:border-sky-500 focus:ring focus:ring-sky-200 focus:ring-opacity-50" id="description" name="description" rows="4" value={description} onChange={onChange} />
                    </div>
                </div>
                    <button className="flex w-full justify-center mt-2 bg-yellow-500 text-white font-semibold font-google-sans py-2 px-4 rounded-md hover:bg-sky-700 transition duration-200" type='submit'>Add</button>
            </form>
        </section>
    )
}

export default ArticleForm;