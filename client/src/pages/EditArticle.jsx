import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getArticleById,
  getArticleBySlug,
  updateArticle,
  reset,
} from "../slices/ArticleSlice";


function readCurrentIdentity() {
  // returns { isAdmin: boolean, userId: string|null }
  try {
    const adminRaw = localStorage.getItem("admin");
    if (adminRaw) {
      const admin = JSON.parse(adminRaw);
      return { isAdmin: true, userId: admin?.id || admin?.userId || admin?._id || null };
    }
  } catch {}
  try {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      return { isAdmin: false, userId: user?.id || user?.userId || user?._id || null };
    }
  } catch {}
  return { isAdmin: false, userId: null };
}

const normalizeTag = (raw) => {
  if (!raw || typeof raw !== "string") return "";
  let t = raw.trim().toLowerCase();
  t = t.replace(/\s+/g, "-");
  t = t.replace(/[^\w\-]/g, "");
  return t.slice(0, 50);
};

export default function EditArticle() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const { currentArticle, isLoadingItem, isUpdating, isError, message } = useSelector(
    (s) => s.articles
  );

  // derive identity
  const { admin } = useSelector((s) => s.admin);
  const { isAdmin: adminFromStorage, userId } = readCurrentIdentity();
  // also detect admin from auth slice if available (non-breaking)
  const isAdmin = adminFromStorage || !!admin;

  // form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [preview, setPreview] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("pending");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // permission state
  const [canEdit, setCanEdit] = useState(false);

  const idParam = params.id || null;
  const slugParam = params.slug || null;

  // fetch article
  useEffect(() => {
    setLocalError("");
    setSuccessMessage("");

    if (idParam) dispatch(getArticleById(idParam));
    else if (slugParam) dispatch(getArticleBySlug(slugParam));

    return () => {
      dispatch(reset());
    };
  }, [dispatch, idParam, slugParam]);

  // populate form when article loads and compute permission
  useEffect(() => {
    if (!currentArticle) return;

    // populate fields (defensive)
    setTitle(currentArticle.title || "");
    setSlug(currentArticle.slug || "");
    setPreview(currentArticle.preview || currentArticle.excerpt || "");
    setBody(currentArticle.body || currentArticle.content || "");
    setStatus(currentArticle.status || "pending");
    setTags(Array.isArray(currentArticle.tags) ? currentArticle.tags : currentArticle.tags ? [currentArticle.tags] : []);

    // author comparison: article.author may be object or id string
    let authorId = null;
    if (currentArticle.author) {
      if (typeof currentArticle.author === "string") authorId = currentArticle.author;
      else if (typeof currentArticle.author === "object") {
        authorId = currentArticle.author.id || currentArticle.author._id || currentArticle.author.userId || null;
      }
    }

    // determine edit permission: author OR admin
    const allowed = Boolean(isAdmin || (userId && authorId && String(userId) === String(authorId)));
    setCanEdit(allowed);
  }, [currentArticle, isAdmin, userId]);

  // tags handlers
  const addTagFromInput = (raw = tagInput) => {
    const parts = String(raw).split(/[,\n]+/).map((p) => normalizeTag(p)).filter(Boolean);
    if (parts.length === 0) {
      setTagInput("");
      return;
    }
    setTags((prev) => {
      const next = Array.from(new Set([...prev, ...parts]));
      return next.slice(0, 10);
    });
    setTagInput("");
  };

  const removeTag = (t) => setTags((prev) => prev.filter((x) => x !== t));

  const onTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagFromInput();
    } else if (e.key === "Backspace" && tagInput === "" && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const validate = () => {
    if (!title.trim()) return "Title is required.";
    if (!body.trim() || body.trim().length < 20) return "Body must be at least 20 characters.";
    if (slug && /\s/.test(slug)) return "Slug must not contain spaces.";
    if (tags.length > 10) return "At most 10 tags are allowed.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");

    if (!canEdit) {
      setLocalError("You do not have permission to edit this article.");
      return;
    }

    const err = validate();
    if (err) {
      setLocalError(err);
      return;
    }

    const payload = {
      title: title.trim(),
      body,
      preview: preview?.trim() || undefined,
      // only send status and slug if admin
      ...(isAdmin ? { status } : {}),
      ...(isAdmin && slug ? { slug: slug.trim() } : {}),
      tags,
    };

    const idToUpdate = idParam || (currentArticle && (currentArticle.id || currentArticle._id));
    if (!idToUpdate) {
      setLocalError("No article id available to update.");
      return;
    }

    try {
      const action = await dispatch(updateArticle({ id: idToUpdate, articleData: payload }));
      if (action.error) {
        const errMsg = action.payload || action.error.message || "Failed to update article";
        setLocalError(errMsg);
        return;
      }
      setSuccessMessage("Article updated successfully.");
      // optionally navigate to article page:
      // navigate(`/articles/${action.payload?.slug || idToUpdate}`);
    } catch (err) {
      setLocalError(String(err) || "Failed to update article.");
    }
  };

  // UI: show message if user can't edit
  if (isLoadingItem && !currentArticle) {
    return (
      <div className="p-6">
        <div className="animate-pulse bg-gray-100 rounded-md p-6">Loading article…</div>
      </div>
    );
  }

  return (
    <main className="max-w-sm md:max-w-3xl text-black  bg-blue-400 rounded-2xl border-2 border-black my-4 mx-auto p-3 md:p-6">
      <h1 className="text-lg md:text-2xl text-black font-semibold mb-4">Edit Article</h1>

      {/* permission notice */}
      {!canEdit && (
        <div className="mb-4 p-3 text-black rounded border bg-yellow-50">
          You can only edit this article if you're the author or an admin.
        </div>
      )}

      {(isError || localError || message) && (
        <div className="mb-4 p-3 rounded border bg-red-50 text-red-700">
          {localError || message || "An error occurred."}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded border bg-green-50 text-green-700">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border bg-white rounded text-sm md:text-md p-1 md:p-2"
            placeholder="Article title"
            disabled={!canEdit}
          />
        </div>
{admin &&
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          {/* Slug - visible / editable only to admins */}
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`w-full border text-sm md:text-md rounded p-1 md:p-2 ${!isAdmin ? "bg-gray-50" : ""}`}
              placeholder="optional-slug-for-url"
              disabled={!isAdmin || !canEdit}
              title={!isAdmin ? "Only admins can edit slug" : ""}
            />
            {!isAdmin && (
              <p className="text-xs text-gray-500 mt-1">Only admins can change the slug.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!isAdmin || !canEdit}
              className={`w-full border text-[15px] md:text-md rounded p-1 md:p-2 ${!isAdmin ? "bg-gray-50" : ""}`}
              title={!isAdmin ? "Only admins can change status" : ""}
            >
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>
            {!isAdmin && (
              <p className="text-xs text-gray-500 mt-1">Only admins can change publish status.</p>
            )}
          </div>
        </div>
}

        <div>
          <label className="block text-[14px] md:text-sm font-medium mb-1">Preview (optional)</label>
          <input
            name="preview"
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            className="w-full border text-sm md:text-md bg-white rounded p-1 md:p-2"
            placeholder="Short preview / excerpt"
            disabled={!canEdit}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Body</label>
          <textarea
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full border text-sm md:text-md bg-white rounded p-2 font-mono"
            placeholder="Write your article body here (supports markdown/HTML depending on setup)"
            disabled={!canEdit}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma separated, max 10)</label>

          <div className="mt-1">
            <div className="flex gap-2">
              <input
                name="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown}
                placeholder="type a tag and press Enter"
                className="flex-1 text-sm md:text-md rounded-md bg-white border p-1 md:p-2"
                disabled={!canEdit}
              />
              <button
                type="button"
                onClick={() => addTagFromInput()}
                className="bg-slate-800 text-white px-4 rounded-md"
                disabled={!canEdit}
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {tags.length === 0 && <div className="text-sm text-gray-400">No tags yet</div>}
              {tags.map((t) => (
                <div
                  key={t}
                  className="flex items-center bg-gray-200 text-sm rounded-full px-3 py-1"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove ${t}`}
                    className="ml-2 text-xs text-red-600"
                    disabled={!canEdit}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canEdit || isUpdating}
            className={`px-3 py-1 md:px-4 md:py-2 rounded text-white ${!canEdit ? "bg-gray-400" : "bg-slate-800 hover:opacity-95"}`}
          >
            {isUpdating ? "Saving..." : "Save changes"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentArticle) {
                setTitle(currentArticle.title || "");
                setSlug(currentArticle.slug || "");
                setPreview(currentArticle.preview || "");
                setBody(currentArticle.body || "");
                setStatus(currentArticle.status || "pending");
                setTags(Array.isArray(currentArticle.tags) ? currentArticle.tags : currentArticle.tags ? [currentArticle.tags] : []);
                setLocalError("");
                setSuccessMessage("");
              } else {
                navigate(-1);
              }
            }}
            className="px-2 py-1 md:px-3 md:py-2 bg-yellow-500 border rounded"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-2 py-1 md:px-3 md:py-2 bg-red-600  border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
