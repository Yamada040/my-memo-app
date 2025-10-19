'use client'
import { Memo } from "@/types/memo";
import { Plus, X, Edit2, Trash2, Pin } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showDeleteModal && (
        <div
          onClick={() => setShowDeleteModal(false)}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-80 slide-in"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              メモを削除しますか？
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            メモアプリ
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            思いついたことをすぐにメモ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム：フォーム */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                新しいメモ
              </h2>
              <form onSubmit={handleAddMemo} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="タイトル"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (titleError) setTitleError("");
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {titleError && <p className="text-red-500 text-sm mt-1">{titleError}</p>}
                </div>
                <textarea
                  placeholder="内容"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent h-24 resize-none"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  メモを追加
                </button>
              </form>
            </div>

            {/* カテゴリー管理 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                カテゴリー管理
              </h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="新しいカテゴリー"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
                      setCategories([...categories, newCategory.trim()]);
                      setNewCategory("");
                    }
                  }}
                  disabled={!newCategory.trim()}
                  className={`flex items-center gap-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    newCategory.trim()
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Plus size={16} />
                  追加
                </button>
              </div>
              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{category}</span>
                      <button
                        onClick={() => deleteCategory(category)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  カテゴリーがありません
                </p>
              )}
            </div>

            {/* フィルター */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                フィルター
              </h2>
              <div className="space-y-2">
                {["全て", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterCategory === cat
                        ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右カラム：メモ一覧 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="newest">新しい順</option>
                  <option value="oldest">古い順</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {sortedMemos.map((memo) => (
                <div
                  key={memo.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 slide-in"
                >
                  {memo.id === editingId ? (
                    <div className="space-y-4">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent h-24 resize-none"
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(memo.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">
                            {memo.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(memo.createdAt).toLocaleDateString('ja-JP')}
                            </span>
                            {memo.category && (
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                {memo.category}
                              </span>
                            )}
                            {memo.pinned && (
                              <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-full">
                                ピン留め
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
                        {memo.content}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(memo)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                        >
                          <Edit2 size={14} />
                          編集
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTargetId(memo.id);
                            setShowDeleteModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                          削除
                        </button>
                        <button
                          onClick={() => togglePin(memo.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                        >
                          <Pin size={14} />
                          {memo.pinned ? "ピン解除" : "ピン留め"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {sortedMemos.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>メモがありません</p>
                  <p className="text-sm mt-2">新しいメモを作成してください</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}