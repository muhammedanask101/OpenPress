import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import ArticleForm from "../components/articleForm";

const PostArticle = () => {

    const navigate = useNavigate();
    const { user } = useSelector(state => state.user);

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    return (
        <>
            <div className="text-blue-700 text-wrap font-bold text-lg text-center md:text-3xl">Post an Article</div>
            <ArticleForm />
        </>
    )
}

export default PostArticle;