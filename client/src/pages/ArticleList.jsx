import ArticleArray from '../components/ArticleArray';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const ArticleList = () => {

    const navigate = useNavigate();
    const { user } = useSelector(state => state.users);

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    return (
        <section>
            <h1 className="block lg:hidden text-3xl font-bold text-amber-100 my-4 p-2 text-center text-shadow-md text-shadow-black">Articles</h1>
            <ArticleArray />
        </section>
    )
}

export default ArticleList;