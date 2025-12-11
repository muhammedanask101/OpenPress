import { useNavigate } from "react-router-dom";

const Article = ({ article }) => {

  const navigate = useNavigate();

  const authorName =
    article.author && typeof article.author === "object"
      ? article.author.name
      : "Unknown Author";

  const preview =
    article.preview?.trim() ||
    article.excerpt?.trim() ||
    (article.body
      ? article.body.slice(0, 200) + (article.body.length > 200 ? "..." : "")
      : "");

    const handleClick = () => {
      navigate(`/articles/${article.slug}`);
    }

  return (
    <div className="p-3 bg-white shadow-md border-2 border-black w-full rounded-xl text-left ml-2 " onClick={handleClick}>
      <h2 className="text-[17px] md:text-xl text-shadow-2xs text-black font-bold font-sans mb-1 hover:text-yellow-500">{article.title}</h2>
      <p className="text-sm md:text-[15px] font-google-sans text-red-600 hover:text-blue-700 mb-3 mdmb-2">{authorName}</p>
      <div className="font-sans text-[14px] md:text-[16px] text-black mb-4 md:mb-3"> {preview} </div>
      <p className="font-google-sans text-black text-[12px] md:text-sm">Published at {new Date(article.createdAt).toLocaleString("en-US", 
      { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
  )
}

export default Article;
