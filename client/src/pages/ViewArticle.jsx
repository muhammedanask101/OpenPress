import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getArticleBySlug, reset } from '../slices/ArticleSlice';
import FallbackLoading from '../components/FallbackLoading';

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

  // detect if body contains HTML tags (only render as HTML if server sanitized)
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(article.body || '');

  return (
    <main className="max-w-4xl my-2  mx-auto p-2">
      <header className="mb-5">
        <h1 className="text-xl md:text-3xl text-black font-inter font-bold mb-1 md:mb-2">{article.title}</h1>
        <div className="text-[13px] md:text-[15px] text-black">
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

      <article className="prose max-w-none font-merriweather text-[16px] md:mt-7 md:text-[19px] text-black leading-relaxed ">
          <div className="whitespace-pre-line">{article.body}</div>
      </article>
    </main>
  );
};

export default ViewArticle;
