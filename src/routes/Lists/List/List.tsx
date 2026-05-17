import { AnimatePresence, motion } from "framer-motion";
import Header from "../../../components/header/Header";
import AuthContext from "../../../utils/contexts/sessions/AuthContext";
import type { List } from "../../../utils/types/Types";

import { Plus, Pencil, Trash2, X, Save, Link as LinkIcon } from "lucide-react";

import { useContext, useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router";
import MyError from "../../../components/error/Error";

type ListItem = {
  itemid: string;
  listid: string;
  name: string;
  description?: string;
  link?: string;
  created?: string;
};

type User = {
  uid: number;
};

export default function List() {
  const { listid } = useParams();
  const navigate = useNavigate();

  const context = useContext(AuthContext);

  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUid, setCurrentUid] = useState<number | null>(null);

  /* ================= MODALS ================= */

  const [showCreateItem, setShowCreateItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showDeleteItem, setShowDeleteItem] = useState(false);

  const [showEditList, setShowEditList] = useState(false);
  const [showDeleteList, setShowDeleteList] = useState(false);

  /* ================= FORMS ================= */

  const [editingItem, setEditingItem] = useState<ListItem | null>(null);

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    link: "",
  });

  const [listForm, setListForm] = useState({
    name: "",
    description: "",
  });

  /* ================= GET CURRENT USER ================= */

  useEffect(() => {
    async function resolveUser() {
      try {
        if (context?.user?.uid) {
          setCurrentUid(context.user.uid);
          return;
        }

        const storedUid = localStorage.getItem("uid");

        if (!storedUid) return;

        const res = await fetch(
          `https://webdev.aboutkonrad.com/api/users/id/${storedUid}`,
        );

        if (!res.ok) return;

        const data: User = await res.json();

        if (data?.uid) {
          setCurrentUid(data.uid);
        }
      } catch (err) {
        console.error(err);
      }
    }

    resolveUser();
  }, [context]);

  /* ================= FETCH LIST ================= */

  useEffect(() => {
    async function fetchData() {
      if (!listid) {
        setError("No list ID provided");
        setLoading(false);
        return;
      }

      try {
        const [listRes, itemsRes] = await Promise.all([
          fetch(
            `https://webdev.aboutkonrad.com/api/lists/user/list/${encodeURIComponent(listid)}`,
          ),
          fetch(
            `https://webdev.aboutkonrad.com/api/lists/items/${encodeURIComponent(listid)}`,
          ),
        ]);

        if (!listRes.ok) {
          throw new Error("Failed to fetch list");
        }

        const listData = await listRes.json();
        const itemsData = await itemsRes.json();

        setList(listData);
        setItems(itemsData);

        setListForm({
          name: listData.name || "",
          description: listData.description || "",
        });
      } catch (err) {
        console.error(err);
        /* setError("Failed to fetch list"); */
        return (
          <MyError
            ErrorCode={404}
            ErrorMessage="This list could not be found. Try again later."
          />
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [listid]);

  /* ================= OWNER CHECK ================= */

  const isOwner = useMemo(() => {
    if (!list || !currentUid) return false;

    return list.owner_uid === currentUid;
  }, [list, currentUid]);

  /* ================= CREATE ITEM ================= */

  async function createItem() {
    if (!listid) return;

    try {
      const res = await fetch(
        `https://webdev.aboutkonrad.com/api/lists/items/create/${listid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemForm),
        },
      );

      const data = await res.json();

      setItems((prev) => [...prev, data]);

      setItemForm({
        name: "",
        description: "",
        link: "",
      });

      setShowCreateItem(false);
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= UPDATE ITEM ================= */

  async function updateItem() {
    if (!editingItem) return;

    try {
      const res = await fetch(
        `https://webdev.aboutkonrad.com/api/lists/items/update/${editingItem.itemid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemForm),
        },
      );

      const updated = await res.json();

      setItems((prev) =>
        prev.map((item) => (item.itemid === updated.itemid ? updated : item)),
      );

      setShowEditItem(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= DELETE ITEM ================= */

  async function deleteItem() {
    if (!editingItem) return;

    try {
      await fetch(
        `https://webdev.aboutkonrad.com/api/lists/items/delete/${editingItem.itemid}`,
        {
          method: "DELETE",
        },
      );

      setItems((prev) =>
        prev.filter((item) => item.itemid !== editingItem.itemid),
      );

      setShowDeleteItem(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= UPDATE LIST ================= */

  async function updateList() {
    if (!list) return;

    try {
      const res = await fetch(
        `https://webdev.aboutkonrad.com/api/lists/update/${list.listid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(listForm),
        },
      );

      const updated = await res.json();

      setList(updated);
      setShowEditList(false);
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= DELETE LIST ================= */

  async function deleteList() {
    if (!list) return;

    try {
      await fetch(
        `https://webdev.aboutkonrad.com/api/lists/delete/${list.listid}`,
        {
          method: "DELETE",
        },
      );

      navigate("/lists");
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : list ? (
          <>
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4 mb-10">
              <div>
                <h1 className="text-4xl font-bold">{list.name}</h1>

                <p className="text-zinc-400 mt-3">
                  {list.description || "No description"}
                </p>
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditList(true)}
                    className="p-3 rounded-xl transition border cursor-pointer hover:bg-neutral-400"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => setShowDeleteList(true)}
                    className="bg-red-600 hover:bg-red-800 p-3 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 size={18} color="white" />
                  </button>
                </div>
              )}
            </div>

            {/* ITEMS */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold">Items ({items.length})</h2>

              {isOwner && (
                <button
                  onClick={() => setShowCreateItem(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium hover:opacity-90 cursor-pointer transition border border-(--local-green) hover:bg-neutral-200"
                >
                  <Plus size={18} />
                  Add Item
                </button>
              )}
            </div>

            <div className="grid gap-4">
              {items.map((item) => (
                <div key={item.itemid} className="border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{item.name}</h3>

                      {item.description && (
                        <p className="text-zinc-400 mt-2">{item.description}</p>
                      )}

                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-blue-400 mt-3 hover:underline"
                        >
                          <LinkIcon size={16} />
                          Product Link
                        </a>
                      )}
                    </div>

                    {isOwner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);

                            setItemForm({
                              name: item.name || "",
                              description: item.description || "",
                              link: item.link || "",
                            });

                            setShowEditItem(true);
                          }}
                          className=" p-2 rounded-lg border border-(--local-green) hover:bg-neutral-200 transition cursor-pointer"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowDeleteItem(true);
                          }}
                          className="bg-red-600 hover:bg-red-500 p-2 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={16} color="white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {/* ================= CREATE ITEM MODAL ================= */}

      {showCreateItem && (
        <Modal title="Create Item" onClose={() => setShowCreateItem(false)}>
          <ItemForm itemForm={itemForm} setItemForm={setItemForm} />

          <button
            onClick={createItem}
            disabled={itemForm.name === null || itemForm.name === ""}
            className="w-full bg-(--local-green) hover:bg-(--local-green-dark) transition-all duration-300 text-white rounded-xl py-3 font-semibold mt-5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-(--local-green)"
          >
            Create
          </button>
        </Modal>
      )}

      {/* ================= EDIT ITEM MODAL ================= */}

      {showEditItem && (
        <Modal title="Edit Item" onClose={() => setShowEditItem(false)}>
          <ItemForm itemForm={itemForm} setItemForm={setItemForm} />

          <button
            onClick={updateItem}
            disabled={itemForm.name === null || itemForm.name === ""}
            className="w-full bg-(--local-green) hover:bg-(--local-green-dark) transition-all duration-300 text-white rounded-xl py-3 font-semibold mt-5 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-(--local-green)"
          >
            <Save size={18} />
            Save Changes
          </button>
        </Modal>
      )}

      {/* ================= DELETE ITEM MODAL ================= */}

      {showDeleteItem && (
        <Modal title="Delete Item" onClose={() => setShowDeleteItem(false)}>
          <p className="text-neutral-600">Delete this item permanently?</p>

          <button
            onClick={deleteItem}
            className="w-full bg-red-600 hover:bg-red-500 transition-all duration-300 text-white rounded-xl py-3 font-semibold mt-5 cursor-pointer"
          >
            Delete
          </button>
        </Modal>
      )}

      {/* ================= EDIT LIST MODAL ================= */}

      {showEditList && (
        <Modal title="Edit List" onClose={() => setShowEditList(false)}>
          <input
            value={listForm.name}
            onChange={(e) =>
              setListForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            placeholder="List name"
            className="w-full border rounded-xl px-4 py-3 mb-3"
          />

          <textarea
            value={listForm.description}
            onChange={(e) =>
              setListForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Description (optional)"
            className="w-full border rounded-xl px-4 py-3 min-h-30"
          />

          <button
            onClick={updateList}
            disabled={listForm.name === null || listForm.name === ""}
            className="w-full border bg-(--local-green) hover:bg-(--local-green-dark) transition-all duration-300 text-white rounded-xl py-3 font-semibold mt-5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-(--local-green)"
          >
            Save
          </button>
        </Modal>
      )}

      {/* ================= DELETE LIST MODAL ================= */}

      {showDeleteList && (
        <Modal title="Delete List" onClose={() => setShowDeleteList(false)}>
          <p className="text-neutral-700">
            Delete this entire list permanently?
          </p>

          <button
            onClick={deleteList}
            className="w-full bg-red-600 hover:bg-red-500 transition-all duration-300 text-white rounded-xl py-3 font-semibold mt-5 cursor-pointer"
          >
            Delete List
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ================= ITEM FORM ================= */

function ItemForm({
  itemForm,
  setItemForm,
}: {
  itemForm: {
    name: string;
    description: string;
    link: string;
  };
  setItemForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      link: string;
    }>
  >;
}) {
  return (
    <div className="space-y-3">
      <input
        value={itemForm.name}
        onChange={(e) =>
          setItemForm((prev) => ({
            ...prev,
            name: e.target.value,
          }))
        }
        placeholder="Name"
        className="w-full border rounded-xl px-4 py-3"
      />

      <textarea
        value={itemForm.description}
        onChange={(e) =>
          setItemForm((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
        placeholder="Description (optional)"
        className="w-full border rounded-xl px-4 py-3 min-h-30"
      />

      <input
        value={itemForm.link}
        onChange={(e) =>
          setItemForm((prev) => ({
            ...prev,
            link: e.target.value,
          }))
        }
        placeholder="Link (optional)"
        className="w-full border rounded-xl px-4 py-3"
      />
    </div>
  );
}

/* ================= MODAL ================= */

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div className="w-full max-w-lg border bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>

            <button
              onClick={onClose}
              className="hover:opacity-70 cursor-pointer"
            >
              <X />
            </button>
          </div>

          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
