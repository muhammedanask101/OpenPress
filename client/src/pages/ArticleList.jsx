import ArticleArray from '../components/ArticleArray';
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const ArticleList = () => {

    const navigate = useNavigate();
    const { user } = useSelector(state => state.user);

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    return (
        <section>
            <h1 className="block lg:hidden text-2xl md:text-3xl font-bold text-blue-700 mb-5 md:mb-3 mt-1 md:my-4 p-2 text-center">Articles</h1>
            <div className='md:mr-4 mr-1 text-right my-3 md:my-4'>
            <Link className='text-[13px] p-2 font-bold md:text-[15px] md:font-extrabold border-2 md:p-3 rounded-lg bg-blue-300 border-black text-black' to="/postarticle">Post Article</Link>
            </div>
            <ArticleArray />
        </section>
    )
}

export default ArticleList;