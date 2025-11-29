

const Article = ({ article }) => {

  return (
    <div className="p-8 bg-neutral-950 shadow-md shadow-blue-300 w-full max-w-md rounded-xl text-center">
      <h2 className="text-lg md:text-xl text-shadow-2xs text-shadow-amber-400 font-bold font-sans mt-2 mb-8">{article.title}</h2>
      <p className="text-sm md:text-[15px] m-2 font-google-sans">{article.description}</p>
      <div className="m-5 font-sans text-blue-300 hover:text-red-500"> <a href={article.fileurl} target="_blank" rel="noopener noreferrer">view article</a> </div>
      <div className="font-google-sans text-sm">{new Date(article.createdAt).toLocaleString('en-US')}</div>
    </div>
  )
}

export default Article;
