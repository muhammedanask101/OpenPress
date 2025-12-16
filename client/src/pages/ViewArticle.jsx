import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getArticleBySlug, reset } from '../slices/ArticleSlice';
import FallbackLoading from '../components/FallbackLoading';
import { fetchMediaForItem } from "../slices/mediaSlice";

function renderArticleBody(body, mediaMap) {
  if (!body) return null;

  /* -------------------------------
     Extract references
  -------------------------------- */
  const referenceRegex = /^\[\^(\w+)\]:\s*(.+)$/gm;
  const references = {};
  let match;

  while ((match = referenceRegex.exec(body)) !== null) {
    references[match[1]] = match[2];
  }

  // Remove reference definitions from main body
  const cleanBody = body.replace(referenceRegex, '').trim();

  /* -------------------------------
     Split media blocks
  -------------------------------- */
  const parts = cleanBody.split(/\[\[media:(.*?)\]\]/g);

  /* -------------------------------
     Inline formatter
  -------------------------------- */
  const formatInline = (text) => {
    const tokens = [];
    let remaining = text;
    let key = 0;

    const patterns = [
      { regex: /^\[\^(\w+)\]/, type: 'footnote' },
      { regex: /^\*\*(.+?)\*\*/, type: 'bold' },
      { regex: /^\*(.+?)\*/, type: 'italic' },
      { regex: /^\[(.+?)\]\((.+?)\)/, type: 'link' },
    ];

    while (remaining.length) {
      let matched = false;

      for (const { regex, type } of patterns) {
        const m = remaining.match(regex);
        if (!m) continue;

        const [full, a, b] = m;

        if (type === 'footnote') {
          tokens.push(
            <sup key={key++} className="text-xs ml-0.5">
              <a href={`#ref-${a}`} className="text-blue-600">
                [{a}]
              </a>
            </sup>
          );
        }

        if (type === 'bold') tokens.push(<strong key={key++}>{a}</strong>);
        if (type === 'italic') tokens.push(<em key={key++}>{a}</em>);
        if (type === 'link') {
          tokens.push(
            <a
              key={key++}
              href={b}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {a}
            </a>
          );
        }

        remaining = remaining.slice(full.length);
        matched = true;
        break;
      }

      if (!matched) {
        tokens.push(remaining[0]);
        remaining = remaining.slice(1);
      }
    }

    return tokens;
  };

  /* -------------------------------
     Render blocks
  -------------------------------- */
  const content = parts.map((part, i) => {
    // MEDIA
    if (i % 2 === 1) {
      const media = mediaMap[part];
      return media ? (
        <figure key={`media-${part}`} className="my-8">
          <img src={media.url} loading="lazy" className="rounded-lg mx-auto" />
        </figure>
      ) : (
        <div key={`media-${part}`} className="italic text-gray-400 my-6">
          [Image loading…]
        </div>
      );
    }

    // TEXT
    return part.split('\n').map((line, idx) => {
      const t = line.trim();
      if (!t) return null;

      // Subtitle
      const sub = t.match(/^_(.+)_$/);
      if (sub) {
        return (
          <h3
            key={`sub-${i}-${idx}`}
            className="mt-10 mb-4 text-xl md:text-2xl font-semibold text-red-700"
          >
            {sub[1]}
          </h3>
        );
      }

      // Bullet
      if (t.startsWith('- ')) {
        return (
          <ul key={`ul-${i}-${idx}`} className="list-disc ml-6 my-3">
            <li>{formatInline(t.slice(2))}</li>
          </ul>
        );
      }

      return (
        <p key={`p-${i}-${idx}`} className="my-3">
          {formatInline(line)}
        </p>
      );
    });
  });

  /* -------------------------------
     Render references
  -------------------------------- */
  const referenceList = Object.entries(references);

  return (
    <>
      {content}

      {referenceList.length > 0 && (
        <section className="mt-14 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">References</h3>
          <ol className="list-decimal ml-6 space-y-2 text-sm">
            {referenceList.map(([id, text]) => (
              <li key={id} id={`ref-${id}`}>
                {text}
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
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
