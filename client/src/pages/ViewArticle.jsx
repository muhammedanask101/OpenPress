import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getArticleBySlug, reset } from '../slices/ArticleSlice';
import FallbackLoading from '../components/FallbackLoading';
import { fetchMediaForItem } from "../slices/mediaSlice";

function renderArticleBody(body, mediaMap) {
  const parts = body.split(/\[\[media:(.*?)\]\]/g);

  return parts.map((part, i) => {
    if (i % 2 === 1) {

      const media = mediaMap[part];
      if (!media) {
        return (
          <div key={part} className="my-6 text-sm text-gray-400 italic">
            [Image loading…]
          </div>
        );
      }


      return (
        <figure key={part} className="my-6">
          <img
            src={media.url}
            className="w-full max-w-full h-auto rounded-lg mx-auto"
            loading="lazy"
          />
        </figure>
      );
    }

    return <p key={i}>{part}</p>;
  });
}


const ViewArticle = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const requestedSlugRef = useRef(null);

  // Support multiple possible slice shapes (currentArticle vs article)
  const articlesSlice = useSelector((s) => s.articles || {});
  const article = articlesSlice.currentArticle ?? articlesSlice.article ?? null;

  // derive sensible loading state from slice flags
  const isLoading = !!(articlesSlice.isLoadingItem || articlesSlice.isLoadingList);
  const isError = !!articlesSlice.isError;
  const isSuccess = !!articlesSlice.isSuccess;
  const message = articlesSlice.message || '';

  useEffect(() => {
    if (article?.id) {
      dispatch(fetchMediaForItem({ kind: "article", itemId: article.id }));
    }
  }, [article?.id, dispatch]);

  const { itemMedia } = useSelector(s => s.media);


  const mediaList =
    article?.id && itemMedia[`article:${article.id}`]
      ? itemMedia[`article:${article.id}`]
      : [];

  const mediaMap = Object.fromEntries(
    mediaList.map(m => [String(m.id), m])
  );




  // Fetch once per slug (ref guard prevents double-dispatch in dev StrictMode)
  useEffect(() => {
    if (!slug) return;
    if (requestedSlugRef.current === slug) return;

    requestedSlugRef.current = slug;
    dispatch(getArticleBySlug(slug));

    return () => {
      requestedSlugRef.current = null;
      dispatch(reset());
    };
  }, [slug, dispatch]);

  // Handle errors and not-found after request completes
  useEffect(() => {
    if (isError) {
      toast.error(message || 'Failed to load article');
    }

    // Only redirect / show not-found after loading finishes
    if (!isLoading && isSuccess && !article) {
      toast.info('Article not found');
      navigate('/articles', { replace: true });
    }
  }, [isError, isLoading, isSuccess, article, message, navigate]);

  if (isLoading) return <FallbackLoading />;

  if (!article) {
    return (
      <div className="p-6">
        <h2 className="text-xl text-black font-semibold">Article not found</h2>
        <p className="text-sm text-red-800">It may have been removed or is not published.</p>
      </div>
    );
  }

  const authorName =
    article.author && typeof article.author === 'object' ? article.author.name : 'Unknown author';


  return (
    <main className="max-w-4xl bg-white md:bg-transparent mx-auto p-5">
      <header className="mt-4 mb-8">
        <h1 className="text-3xl md:text-3xl text-black font-inter font-bold mb-1 md:mb-2">{article.title}</h1>
        <div className="text-[13px] mt-8 md:text-[15px] text-black">
          <span className="font-medium text-red-700 hover:text-blue-800">{authorName}</span>
          <span className="mx-1">•</span>
          <span>
            {new Date(article.publishDate || article.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </header>

      <article className="prose max-w-none overflow-x-hidden font-merriweather text-[16px] md:mt-7 md:text-[19px] text-black leading-relaxed ">
          <div className="whitespace-pre-line">{renderArticleBody(article.body, mediaMap)}</div>
      </article>
    </main>
  );
};

export default ViewArticle;
