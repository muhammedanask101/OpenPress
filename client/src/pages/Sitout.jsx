import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getArticles,
  reset,
} from "../slices/ArticleSlice";
import { Link, useNavigate } from "react-router-dom";



function Skeleton({ lines = 3 }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-full" />
      ))}
    </div>
  );
}

function ArticleCard({ article, onOpen }) {
  const title = article.title || "Untitled";
  const excerpt =
    article.preview ||
    article.excerpt ||
    (article.body && article.body.slice(0, 160) + (article.body.length > 160 ? "…" : ""));
  const author = article.author?.name || "Unknown";
  const date = article.createdAt ? new Date(article.createdAt).toLocaleDateString() : "";

  return (
    <article className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{excerpt}</p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
        <div>
          <div>By <span className="font-medium text-gray-700">{author}</span></div>
          <div>{date}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button onClick={() => onOpen(article)} className="text-yellow-600 underline text-sm">Read</button>
        </div>
      </div>
    </article>
  );
}


export default function Sitout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const {
    articles = [],
    myArticles = [],
    isLoadingList = false,
    isLoadingItem = false,
    isUpdating = false,
    isDeleting = false,
    isError = false,
    message = "",
    pagination,
  } = useSelector((s) => s.articles || {});

  const [localMessage, setLocalMessage] = useState("");
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [newestLimit, setNewestLimit] = useState(12);

  useEffect(() => {
    setLocalMessage("");
    dispatch(getArticles());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);


  const featured = useMemo(() => {
    if (!Array.isArray(articles)) return [];
    const starred = articles.filter(a => a.isFeatured);
    if (starred.length) return starred.slice(0, 3);
    return articles.slice(0, 3);
  }, [articles]);

  const newest = useMemo(() => {
    if (!Array.isArray(articles)) return [];
    const copy = [...articles];
    copy.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return copy.slice(0, newestLimit);
  }, [articles, newestLimit]);


  // Search + filter
  const visibleNewest = useMemo(() => {
    let list = newest;
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(a => (a.title || "").toLowerCase().includes(q) || (a.body || "").toLowerCase().includes(q));
    }
    if (tagFilter) {
      list = list.filter(a => Array.isArray(a.tags) ? a.tags.includes(tagFilter) : (String(a.tags || "") === tagFilter));
    }
    return list;
  }, [newest, query, tagFilter]);

  // Handlers
  const openArticle = (a) => {
    if (a?.slug) navigate(`/articles/${a.slug}`);
  };

  // collect available tags for quick filter
  const allTags = useMemo(() => {
    const s = new Set();
    (articles || []).forEach(a => {
      if (Array.isArray(a.tags)) a.tags.forEach(t => s.add(t));
      else if (a.tags) s.add(String(a.tags));
    });
    return Array.from(s).slice(0, 12);
  }, [articles]);


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="hidden md:block text-2xl md:text-4xl font-serif font-bold text-red-700">
              Kerala Muslim Community
            </h1>
            <h1 className="block md:hidden text-2xl md:text-4xl font-serif font-bold text-red-700">
                A Community of Keralite Muslims
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2 md:mt-1">Connecting duas & knowledge across Kerala</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="hidden md:inline-block bg-yellow-500 text-white px-4 py-2 rounded shadow">Write</button>
            <button onClick={() => navigate("/login")} className="hidden md:inline-block px-3 py-2 border rounded bg-white">Sign in</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* About Us (red & yellow themed) */}
        <section className="bg-gradient-to-r from-red-50 to-yellow-50 border-2 border-red-700 rounded-xl p-6 md:p-8">
          <div className="md:flex md:items-center md:gap-8">
            <div className="md:flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-red-700">
                About Us
              </h2>
              <p className="mt-3 text-base text-red-800">
                We are a community platform that connects Muslims in <span className="font-semibold text-yellow-600">Kerala</span>.
                Share advice, write guides, promote learning, and ask questions with us. Together we make a supportive space to share knowledge and to ask questions!
              </p>

              <ul className="mt-4 space-y-2 text-sm text-red-900">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block mt-2" />
                  QnA, events & resources.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block mt-2" />
                  Member-created and fact-checked content.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block mt-2" />
                  Respectful moderation and community safety.
                </li>
              </ul>
            </div>

            <div className="mt-6 md:mt-0 md:w-80 bg-white rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold text-red-700">Quick Links</h3>
              <div className="mt-3 space-y-3">
                <button onClick={() => navigate("/login")} className="w-full py-2 rounded bg-yellow-500 text-white">Write an article</button>
                <button className="w-full py-2 rounded border border-red-700 text-red-700">
                    <a href="https://discord.gg/GnBeB7bhvc" target="_blank" rel="noopener noreferrer">Discord Server</a>
                </button>
                <button onClick={() => navigate("/login")} className="w-full py-2 rounded bg-red-700 text-white">Learn more</button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Featured</h2>
            <div className="text-sm text-gray-500">Hand-picked / trending</div>
          </div>

          {isLoadingList ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded shadow"><Skeleton lines={5} /></div>
              <div className="p-4 bg-white rounded shadow"><Skeleton lines={5} /></div>
              <div className="p-4 bg-white rounded shadow"><Skeleton lines={5} /></div>
            </div>
          ) : featured.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map(a => <ArticleCard key={a._id || a.id} article={a} onOpen={openArticle} />)}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No featured articles yet.</div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold">Articles</h2>
            <div className="text-sm text-gray-500">{visibleNewest.length} shown</div>
          </div>
        </section>

        {/* Search + Tag filter */}
        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <input
              aria-label="Search articles"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles or content..."
              className="w-full md:w-96 px-3 py-2 rounded border bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <span>Filter by tag:</span>
              <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="px-2 py-1 border rounded bg-white">
                <option value="">All</option>
                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => { setNewestLimit(12); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-3 py-1 rounded border">Top</button>
              <button onClick={() => { setNewestLimit((l) => Math.min(24, l + 6)); }} className="px-3 py-1 rounded bg-yellow-500 text-white">Load more</button>
            </div>
          </div>
        </section>

        {/* Articles (grid) */}
        <section>

          {isLoadingList ? (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded shadow"><Skeleton lines={4} /></div>
              <div className="p-4 bg-white rounded shadow"><Skeleton lines={4} /></div>
            </div>
          ) : visibleNewest.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleNewest.map(a => (
                <div key={a._id || a.id}>
                  <ArticleCard article={a} onOpen={openArticle} onEdit={null} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No articles match your search.</div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 mt-10 gap-4">
          {/* <div className="bg-white rounded p-4 shadow">
            <h4 className="font-semibold mb-2">Categories</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Local News</li>
              <li>Events</li>
              <li>Guides</li>
              <li>Community Stories</li>
            </ul>
          </div> */}

          <div className="bg-white rounded p-4 shadow">
            <h4 className="font-semibold mb-2">Get Involved</h4>
            <p className="text-sm text-gray-600">Write, moderate or help answer questions? sign up to volunteer.</p>
            <div className="mt-3">
              <button className="px-3 py-2 bg-yellow-500 text-white rounded">
                <a href="https://discord.gg/GnBeB7bhvc" target="_blank" rel="noopener noreferrer">Volunteer</a>
              </button>
            </div>
          </div>

          <div className="bg-white rounded p-4 shadow">
            <h4 className="font-semibold mb-2">Support</h4>
            <p className="text-sm text-gray-600">Questions? <button onClick={() => navigate("/login")} className="text-yellow-600 underline">Contact us</button></p>
            <p className="mt-3 text-xs text-gray-500">Share to keep the community platform running.</p>
            <div className="mt-3">
              <button onClick={() => navigate('/login')} className="px-3 py-2 bg-red-700 text-white rounded">Share</button>
            </div>
          </div>
        </section>
      </main>

      {/* Local toast / message */}
      {localMessage && (
        <div className="fixed bottom-6 right-6 bg-white border p-3 rounded shadow text-sm z-50">
          <div className="flex items-center gap-3">
            <div className="flex-1">{localMessage}</div>
            <button onClick={() => setLocalMessage("")} className="text-xs text-gray-500">Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}
