import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getArticles, getMyArticles } from "../slices/ArticleSlice";
import { useNavigate } from "react-router-dom";

/* ---------------- Article Card ---------------- */
function ArticleCard({ article, editable = false }) {
  const navigate = useNavigate();

  const preview =
    article.preview ||
    article.excerpt ||
    (article.body
      ? article.body.slice(0, 130) + (article.body.length > 130 ? "…" : "")
      : "");

  return (
    <article className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col hover:border-red-700 transition">
      <h3
        onClick={() => navigate(`/articles/${article.slug}`)}
        className="cursor-pointer text-lg font-semibold text-black hover:text-red-800 line-clamp-2"
      >
        {article.title}
      </h3>

      <p className="mt-2 text-sm text-black/80 line-clamp-3">
        {preview}
      </p>

      <div className="mt-auto pt-4 flex justify-between text-xs text-black/70">
        <span>{article.author?.name || "Unknown"}</span>
        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
      </div>

      {editable && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => navigate(`/articles/${article.slug}`)}
            className="text-xs px-3 py-1 rounded bg-yellow-500 text-black hover:bg-yellow-600"
          >
            View
          </button>
          <button
            onClick={() =>
              navigate(`/articles/${article._id || article.id}/edit`)
            }
            className="text-xs px-3 py-1 rounded border border-red-700 text-red-800 hover:bg-red-50"
          >
            Edit
          </button>
        </div>
      )}
    </article>
  );
}

/* ---------------- Main Page ---------------- */
export default function ArticleList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { articles = [], myArticles = [], isLoadingList } =
    useSelector((s) => s.articles);
  const { user } = useSelector((s) => s.user);

  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [limit, setLimit] = useState(6);

  useEffect(() => {
    dispatch(getArticles());
    if (user) dispatch(getMyArticles());
  }, [dispatch, user]);

  /* Newest first */
  const sorted = useMemo(
    () =>
      [...articles].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [articles]
  );

  /* Tags */
  const tags = useMemo(() => {
    const s = new Set();
    sorted.forEach((a) => {
      if (Array.isArray(a.tags)) a.tags.forEach((t) => s.add(t));
    });
    return Array.from(s);
  }, [sorted]);

  /* Search + filter */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return sorted.filter((a) => {
      const matchesText =
        a.title?.toLowerCase().includes(q) ||
        a.body?.toLowerCase().includes(q);

      const matchesTag = tag
        ? Array.isArray(a.tags) && a.tags.includes(tag)
        : true;

      return matchesText && matchesTag;
    });
  }, [sorted, query, tag]);

  const visible = filtered.slice(0, limit);
  const hasMyArticles = myArticles && myArticles.length > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ---------------- Header ---------------- */}
      <header className="border-b border-red-800 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-red-800">
            Articles
          </h1>
          <p className="mt-1 text-sm text-black/70">
            Knowledge and reflections from the community
          </p>
        </div>
      </header>

      {/* ---------------- Toolbar ---------------- */}
      <section className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
          {/* Search + Filter */}
          <div className="flex flex-col gap-3 md:flex-row md:flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="px-3 py-2 rounded border border-gray-300 w-full md:w-80 text-black focus:outline-none focus:border-red-700"
            />

            {/* Mobile-friendly dropdown */}
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="px-3 py-2 rounded border border-gray-300 w-full md:w-48 bg-white text-black"
            >
              <option className="text-[12px] md:text-[17px]" value="">All topics</option>
              {tags.map((t) => (
                <option className="text-[12px] md:text-[17px]" key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/postarticle")}
            className="w-full md:w-auto px-4 py-2 rounded bg-yellow-500 text-black font-medium hover:bg-yellow-600"
          >
            Post Article
          </button>
        </div>
      </section>

      {/* ---------------- Latest Articles ---------------- */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-red-800 mb-3">
          Latest Articles
        </h2>

        {isLoadingList ? (
          <p className="text-black/70">Loading articles…</p>
        ) : visible.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((a) => (
              <ArticleCard key={a._id || a.id} article={a} />
            ))}
          </div>
        ) : (
          <p className="text-black/70">No articles found.</p>
        )}
      </section>

      {/* ---------------- Your Articles (ONLY if exists) ---------------- */}
      {user && hasMyArticles && (
        <section className="max-w-6xl mx-auto px-4 py-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-red-800 mb-3">
            Your Articles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myArticles.map((a) => (
              <ArticleCard key={a._id || a.id} article={a} editable />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Load More ---------------- */}
      {visible.length < filtered.length && (
        <div className="text-center py-8">
          <button
            onClick={() => setLimit((l) => l + 6)}
            className="px-6 py-2 rounded-full border border-red-800 text-red-800 hover:bg-red-50"
          >
            Load more
          </button>
        </div>
      )}
    </main>
  );
}
