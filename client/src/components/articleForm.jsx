import { useState } from "react";
import { useDispatch } from "react-redux";
import { createArticle } from "../slices/ArticleSlice";
import { useNavigate } from "react-router-dom";

const ArticleForm = () => {
  const [details, setDetails] = useState({ title: "", tags: [], body: "" });
  const [tagInput, setTagInput] = useState("");
  const { title, tags, body } = details;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    // Only use this generic handler for title/body — tags handled separately
    if (name === "title" || name === "body") {
      setDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  // normalize single tag: trim, lowercase, replace spaces with hyphen, remove bad chars
  const normalizeTag = (raw) => {
    if (!raw || typeof raw !== "string") return "";
    let t = raw.trim().toLowerCase();
    t = t.replace(/\s+/g, "-"); // optional: convert spaces -> hyphen
    t = t.replace(/[^\w\-]/g, ""); // allow letters/numbers/_/-
    return t.slice(0, 50); // enforce max length
  };

  const addTagFromInput = (rawInput = tagInput) => {
    // support comma-separated input as well
    const parts = String(rawInput).split(/[,\\n]+/).map(p => normalizeTag(p)).filter(Boolean);
    if (parts.length === 0) {
      setTagInput("");
      return;
    }
    setDetails(prev => {
      const next = Array.from(new Set([...prev.tags, ...parts])); // dedupe
      const maxTags = 10;
      return { ...prev, tags: next.slice(0, maxTags) };
    });
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setDetails(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const onTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagFromInput();
    } else if (e.key === "Backspace" && tagInput === "" && tags.length) {
      // optional: remove last tag when backspace on empty input
      setDetails(prev => ({ ...prev, tags: prev.tags.slice(0, -1) }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (title.trim().length < 3) return alert('Title must be at least 3 characters');
    if (body.trim().length < 20) return alert('Body must be at least 20 characters');

    // Basic client-side validation
    if (!title.trim() || !body.trim()) {
      return alert("Title and body are required");
    }

    const articleData = {
      title: title.trim(),
      body: body.trim(),
      tags, // <-- array sent directly
    };

    try {
      await dispatch(createArticle(articleData)).unwrap();
      setDetails({ title: "", body: "", tags: []});
      setTagInput("");
      navigate("/articles"); // optional
    } catch (error) {
      console.error("Article creation failed: ", error);
      // show toast / UI error as appropriate
    }
  };

  return (
    <section className="flex justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="text-[12px] md:text-sm shadow-md shadow-black rounded-lg bg-red-700 p-3 md:p-6 w-full max-w-md md:max-w-xl space-y-2 md:space-y-4"
      >
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-amber-100 font-medium">Enter Article Title:</label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2"
            type="text"
            required
          />
        </div>

        {/* Tags input (uses tagInput string, not details.tags directly) */}
        <div>
          <label htmlFor="tagInput" className="block text-amber-100 font-medium">Tags (press Enter or comma to add)</label>
          <div className="mt-1">
            <div className="flex gap-2">
              <input
                id="tagInput"
                name="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown}
                placeholder="type a tag and press Enter"
                className="flex-1 rounded-md border text-black bg-white border-black shadow-sm p-2"
              />
              <button
                type="button"
                onClick={() => addTagFromInput()}
                className="bg-yellow-500 text-white px-4 rounded-md"
              >
                Add
              </button>
            </div>

            {/* Show chips */}
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.length === 0 && <div className="text-[12px] md:text-sm text-gray-300">No tags yet</div>}
              {tags.map(t => (
                <div key={t} className="flex items-center bg-gray-200 text-sm rounded-full px-3 py-1">
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove ${t}`}
                    className="ml-2 text-xs text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div>
          <label htmlFor="body" className="block text-amber-100 font-medium">Article Body:</label>
          <textarea
            id="body"
            name="body"
            rows={10}
            value={body}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border text-black bg-white border-black shadow-sm p-2"
            required
          />
        </div>

        <button
          type="submit"
          className="flex w-full justify-center mt-2 bg-yellow-500 text-white font-semibold py-2 px-4 rounded-md"
        >
          Post
        </button>
      </form>
    </section>
  );
};

export default ArticleForm;
