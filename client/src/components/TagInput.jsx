import React, { useState } from 'react';

/**
 * TagInput
 * Props:
 *  - value: array of strings
 *  - onChange: (newArray) => void
 *  - maxTags, maxTagLen, placeholder
 */
export default function TagInput({ value = [], onChange, maxTags = 10, maxTagLen = 50, placeholder = 'Type a tag and press Enter' }) {
  const [input, setInput] = useState('');

  const normalize = (raw) => {
    if (!raw) return '';
    let t = String(raw).trim().toLowerCase();
    t = t.replace(/\s+/g, '-'); // convert spaces to hyphen (optional)
    t = t.replace(/[^\w\-]/g, ''); // allow letters, numbers, underscore, hyphen
    if (!t) return '';
    return t.slice(0, maxTagLen);
  };

  const addTag = (raw) => {
    const parts = String(raw).split(/[,\\n]+/).map(p => normalize(p)).filter(Boolean);
    if (parts.length === 0) {
      setInput('');
      return;
    }
    const merged = Array.from(new Set([...(value || []), ...parts])).slice(0, maxTags);
    onChange(merged);
    setInput('');
  };

  const removeTag = (tag) => {
    onChange((value || []).filter(t => t !== tag));
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && (value || []).length > 0) {
      // remove last tag
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div>
      <div className="flex gap-2 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-md border p-2"
        />
        <button type="button" onClick={() => addTag(input)} className="bg-yellow-500 text-white px-3 py-1 rounded-md">Add</button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {(!value || value.length === 0) && <div className="text-sm text-gray-400">No tags</div>}
        {value && value.map(tag => (
          <div key={tag} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm">
            <span>{tag}</span>
            <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-xs text-red-600">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
