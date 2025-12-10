import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getArticles, reset } from "../slices/ArticleSlice";
import Article from "./Article";
import FallbackLoading from "./FallbackLoading";
import { useNavigate } from "react-router-dom";

const ArticleArray = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { articles, isLoading, isError, message } = useSelector(state => state.articles);

    useEffect(() => {
        if(isError) {console.log(message)};
        dispatch(getArticles());
        return () => dispatch(reset());

    }, [navigate, isError, message, dispatch])

    return(
        isLoading ? <FallbackLoading /> : (
            <>
                <section className="grid grid-cols-1 justify-items-center gap-4 p-4 md:p-8">
                    {Array.isArray(articles) && articles.length > 0 ? 
                    (articles.map(article => <Article key={article._id} article={article} />)) : (
                        <p className="text-red-600">No articles to display yet.</p>
                    )}
                </section>
            </>
        )
    )
}

export default ArticleArray;