'use client'
import { Memo } from "@/types/memo";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [titleError, setTitleError] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [filterCategory, setFilterCategory] = useState("全て");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // データ取得
  useEffect(() => {
    const saved = localStorage.getItem("memos");
    if (saved) {
      setMemos(JSON.parse(saved))
    }
  }, []);

  useEffect(() => {
    const savedCategories = localStorage.getItem("categories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    }
  }, []);

  // データ保存
  useEffect(() => {
    localStorage.setItem("memos", JSON.stringify(memos))
  }, [memos]);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories))
  }, [categories]);

  const addMemo = (newMemo: Memo) => {
    setMemos([newMemo, ...memos]);
  };

  const handleAddMemo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError("タイトルを入力してください")
      return;
    }

    const newMemo: Memo = {
      id: crypto.randomUUID(),
      title: title || "無題",
      content: content || "内容なし",
      category: category || "未分類",
      createdAt: new Date().toISOString(),
      pinned: false,
    };
    addMemo(newMemo);

    setTitle("");
    setContent("");
    setCategory("");
    setTitleError("");
  };

  const deleteCategory = (category: string) => {
    setCategories(categories.filter((c) => c != category))
  }
  const startEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setEditTitle(memo.title);
    setEditContent(memo.content);
    setEditCategory(memo.category);
  };
  // 編集保存
  const saveEdit = (id: string) => {
    setMemos(
      memos.map((memo) =>
        memo.id === id ? { ...memo, title: editTitle, content: editContent, category: editCategory } : memo
      )
    );
    setEditingId(null);
  }

  // メモ検索
  const filteredMemos = memos
    .filter((memo) => filterCategory === "全て" || memo.category === filterCategory)
    .filter((memo) =>
      memo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memo.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  // ピン止め機能
  const togglePin = (id: string) => {
    setMemos(
      memos.map((memo) =>
        memo.id === id ? { ...memo, pinned: !memo.pinned } : memo)
    )
  }

  // 並び替え機能
  const sortedMemos = [...filteredMemos].sort((a, b) => {
    const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    if (pinDiff !== 0) return pinDiff;
    if (sortOrder === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen p-6 sm:p-12 bg-gray-50 flex flex-col sm:flex-row gap-8">
      {showDeleteModal && (
        <div
          onClick={() => setShowDeleteModal(false)}
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-lg shadow-lg w-80"
          >
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              本当に削除しますか？
            </h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-gray-700 py-1 px-3 rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (deleteTargetId) {
                    setMemos(memos.filter((memo) => memo.id != deleteTargetId));
                  }
                  setShowDeleteModal(false);
                }}
                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 左カラム：フォーム */}
      <div className="sm:w-1/3 w-full flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-800">📝 My Memo App</h1>
        <form
          onSubmit={handleAddMemo}
          className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4"
        >
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError("");
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {titleError && <p className="text-red-500 text-sm">{titleError}</p>}
          <textarea
            placeholder="本文"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">カテゴリーを選択</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            追加
          </button>
        </form>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">メモ表示フィルタ</h3>
          <div className="flex flex-wrap gap-2">
            {["全て", ...categories].map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${filterCategory === category ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            📂 カテゴリー管理
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="新しいカテゴリー名を入力"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <button
              onClick={() => {
                if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                  setCategories([...categories, newCategory.trim()]);
                  setNewCategory("");
                }
              }}
              disabled={!newCategory.trim()}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg transition font-medium ${newCategory.trim()
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
            >
              <Plus size={18} />
              追加
            </button>
          </div>
          <div className="border-t border-gray-100 pt-3">
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-sm"
                  >
                    <span className="truncate max-w-[100px]">{category}</span>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="hover:text-red-500 transition flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">まだカテゴリーがありません。</p>
            )}
            <p className="text-sm text-gray-500 mt-2 italic">
              例：「自己分析」「企業研究」「ES対策」など
            </p>
          </div>
        </div>
      </div>
      {/* メモ表示 */}
      <div className="sm:w-2/3 w-full flex flex-col gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mt-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">🔍 メモ検索</h3>
          <input
            type="text"
            placeholder="タイトルや本文で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
          className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="newest">新しい順</option>
          <option value="oldest">古い順</option>
        </select>
        {sortedMemos
          .map((memo) => (
            <div key={memo.id} className="bg-white p-5 rounded-xl shadow-md flex flex-col gap-2">
              {memo.id === editingId ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="border p-2 w-full rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value={editCategory}>{editCategory}</option>
                    {categories
                      .filter((category) => category !== editCategory)
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => saveEdit(memo.id)}
                      className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 text-gray-700 py-1 px-3 rounded-md hover:bg-gray-400 text-sm"
                    >
                      キャンセル
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    {memo.title}
                    {memo.category && (
                      <span className="text-sm text-white bg-blue-500 px-2 py-0.5 rounded-full">
                        {memo.category}
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-700 mt-1 whitespace-pre-line">{memo.content}</p>
                  <span className="text-gray-400 text-sm mt-2 block">
                    {new Date(memo.createdAt).toLocaleString()}
                  </span>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => startEdit(memo)}
                      className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 text-sm"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTargetId(memo.id);
                        setShowDeleteModal(true);
                      }}
                      className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 text-sm"
                    >
                      削除
                    </button>
                    <button
                      onClick={() => togglePin(memo.id)}
                      className={`text-sm px-2 py-1 rounded ${memo.pinned ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-800"
                        }`}
                    >
                      {memo.pinned ? "📌 ピン中" : "📍 ピン"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
