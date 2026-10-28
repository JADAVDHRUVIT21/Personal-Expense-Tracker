import { useCallback, useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiChevronDown,
  FiCheck,
  FiDollarSign,
  FiCreditCard,
} from "react-icons/fi";

import { getExpenses } from "../services/expenseService";
import { getCategories } from "../services/categoryService";
import api from "../services/api";

const today = new Date().toLocaleDateString("en-CA");

const emptyForm = {
  title: "",
  amount: "",
  category_id: "",
  expense_date: today,
  notes: "",
};

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError("");
      const [expenseData, categoryData] = await Promise.all([
        getExpenses(),
        getCategories(),
      ]);
      setExpenses(Array.isArray(expenseData) ? expenseData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load expenses and categories."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
    setCategoryPickerOpen(false);
    setShowForm(true);
  };

  const openEditForm = (expense) => {
    setEditingId(expense.id);
    setForm({
      title: expense.title || "",
      amount: String(expense.amount ?? ""),
      category_id: String(expense.category_id ?? ""),
      expense_date: expense.expense_date
        ? String(expense.expense_date).slice(0, 10)
        : today,
      notes: expense.notes || "",
    });
    setFormError("");
    setCategoryPickerOpen(false);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setFormError("");
    setCategoryPickerOpen(false);
  };

  const selectCategory = (categoryId) => {
    setForm((previous) => ({ ...previous, category_id: String(categoryId) }));
    setCategoryPickerOpen(false);
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const amount = Number(form.amount);

    if (!form.title.trim()) return setFormError("Please enter an expense title.");
    if (!Number.isFinite(amount) || amount <= 0) return setFormError("Enter an amount greater than zero.");
    if (!form.category_id) return setFormError("Please select a category.");
    if (!form.expense_date) return setFormError("Please select an expense date.");

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        amount,
        category_id: Number(form.category_id),
        expense_date: form.expense_date,
        notes: form.notes.trim() || null,
      };

      if (editingId !== null) {
        await api.patch(`/expenses/${editingId}`, payload);
      } else {
        await api.post("/expenses", payload);
      }

      setShowForm(false);
      setEditingId(null);
      setCategoryPickerOpen(false);
      setForm({ ...emptyForm });
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setFormError(
        typeof detail === "string"
          ? detail
          : `Unable to ${editingId !== null ? "update" : "save"} the expense. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setError("");

    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Unable to delete this expense.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((item) => Number(item.id) === Number(categoryId));
    return category?.name || `Category #${categoryId ?? "—"}`;
  };

  const selectedCategory = categories.find((category) => String(category.id) === String(form.category_id));

  // Calculate summary stats
  const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300" style={{ backgroundColor: "var(--bg-main)" }}>
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Expenses
            </h1>
            <p className="mt-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Track and manage your daily spending with ease.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95"
            style={{ backgroundColor: "var(--primary-color)", boxShadow: "0 10px 20px -10px var(--primary-color)" }}
          >
            <FiPlus size={19} />
            Add Expense
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div 
            className="mb-6 flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm animate-shake"
            style={{ backgroundColor: "var(--danger-light-bg)", borderColor: "var(--danger-color)", color: "var(--danger-color)" }}
          >
            <span className="font-semibold">{error}</span>
            <button onClick={() => setError("")} className="rounded-lg p-1 transition hover:bg-black/10">
              <FiX size={18} />
            </button>
          </div>
        )}

        {/* Summary Cards (Bento style) */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border p-6 shadow-sm" style={{ backgroundColor: "var(--card-background)", borderColor: "var(--border-color)" }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Total Spending</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--primary-light-bg)", color: "var(--primary-color)" }}>
                <FiDollarSign size={20} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="rounded-2xl border p-6 shadow-sm" style={{ backgroundColor: "var(--card-background)", borderColor: "var(--border-color)" }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Total Transactions</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                <FiCreditCard size={20} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              {expenses.length}
            </p>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div 
            className="mb-8 overflow-hidden rounded-3xl border shadow-xl animate-slide-in-up"
            style={{ backgroundColor: "var(--card-background)", borderColor: "var(--border-color)" }}
          >
            <div className="border-b p-6" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-main)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {editingId !== null ? "Edit Expense" : "Add New Expense"}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    Fill in the details below to record a transaction.
                  </p>
                </div>
                <button
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-full p-2 transition disabled:opacity-50"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--border-color)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="mb-2 block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Expense Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={200}
                    placeholder="e.g. Grocery shopping"
                    required
                    className="w-full rounded-xl border px-4 py-3.5 outline-none transition focus:ring-4"
                    style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border-color)", color: "var(--text-primary)", "--tw-ring-color": "rgba(99, 102, 241, 0.15)" }}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="mb-2 block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span style={{ color: "var(--text-secondary)" }}>₹</span>
                    </div>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                      className="w-full pl-9 pr-4 py-3.5 rounded-xl border outline-none transition focus:ring-4"
                      style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border-color)", color: "var(--text-primary)", "--tw-ring-color": "rgba(99, 102, 241, 0.15)" }}
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="relative">
                  <label htmlFor="category-picker" className="mb-2 block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Category
                  </label>
                  <button
                    id="category-picker"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={categoryPickerOpen}
                    onClick={() => setCategoryPickerOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left outline-none transition focus:ring-4"
                    style={{ backgroundColor: "var(--input-background)", borderColor: categoryPickerOpen ? "var(--primary-color)" : "var(--border-color)", "--tw-ring-color": "rgba(99, 102, 241, 0.15)" }}
                  >
                    <span style={{ color: selectedCategory ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: selectedCategory ? 500 : 400 }}>
                      {selectedCategory?.name || "Select a category"}
                    </span>
                    <FiChevronDown size={18} className={`transition-transform duration-200 ${categoryPickerOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-secondary)" }} />
                  </button>

                  {categoryPickerOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setCategoryPickerOpen(false)} />
                      <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border shadow-xl animate-slide-in-up" style={{ backgroundColor: "var(--card-background)", borderColor: "var(--border-color)" }}>
                        <div className="max-h-60 overflow-y-auto p-2">
                          {categories.length > 0 ? (
                            categories.map((category) => {
                              const selected = String(category.id) === String(form.category_id);
                              return (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={() => selectCategory(category.id)}
                                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition"
                                  style={{ backgroundColor: selected ? "var(--primary-light-bg)" : "transparent", color: selected ? "var(--primary-color)" : "var(--text-primary)", fontWeight: selected ? 600 : 400 }}
                                  onMouseEnter={(e) => { if (!selected) e.currentTarget.style.backgroundColor = "var(--bg-main)"; }}
                                  onMouseLeave={(e) => { if (!selected) e.currentTarget.style.backgroundColor = "transparent"; }}
                                >
                                  <span>{category.name}</span>
                                  {selected && <FiCheck size={16} />}
                                </button>
                              );
                            })
                          ) : (
                            <p className="px-3 py-4 text-sm text-center" style={{ color: "var(--text-secondary)" }}>No categories found.</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="expense_date" className="mb-2 block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Expense Date
                  </label>
                  <input
                    id="expense_date"
                    name="expense_date"
                    type="date"
                    value={form.expense_date}
                    onChange={handleChange}
                    max={today}
                    required
                    className="w-full rounded-xl border px-4 py-3.5 outline-none transition focus:ring-4"
                    style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border-color)", color: "var(--text-primary)", colorScheme: "light dark", "--tw-ring-color": "rgba(99, 102, 241, 0.15)" }}
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="mb-2 block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Add any additional details..."
                    className="w-full resize-y rounded-xl border px-4 py-3.5 outline-none transition focus:ring-4"
                    style={{ backgroundColor: "var(--input-background)", borderColor: "var(--border-color)", color: "var(--text-primary)", "--tw-ring-color": "rgba(99, 102, 241, 0.15)" }}
                  />
                </div>
              </div>

              {formError && (
                <div className="mt-6 rounded-xl border p-4 text-sm font-medium animate-shake" style={{ backgroundColor: "var(--danger-light-bg)", borderColor: "var(--danger-color)", color: "var(--danger-color)" }}>
                  {formError}
                </div>
              )}

              <div className="mt-8 flex items-center justify-end gap-3 border-t pt-6" style={{ borderColor: "var(--border-color)" }}>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border px-6 py-3 font-semibold transition disabled:opacity-50"
                  style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-main)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || categories.length === 0}
                  className="rounded-xl px-8 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                  style={{ backgroundColor: "var(--primary-color)", boxShadow: "0 10px 20px -10px var(--primary-color)" }}
                >
                  {saving ? "Saving..." : editingId !== null ? "Save Changes" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data Table Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border py-24" style={{ backgroundColor: "var(--card-background)", borderColor: "var(--border-color)" }}>
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--border-color)", borderTopColor: "var(--primary-color)" }} />
            <p className="font-medium" style={{ color: "var(--text-secondary)" }}>Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20 px-4 text-center" style={{ backgroundColor: "var(--card-background)", borderColor: "var(--border-color)" }}>
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--primary-light-bg)", color: "var(--primary-color)" }}>
              <FiCreditCard size={32} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>No expenses yet</h2>
            <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--text-secondary)" }}>
              You haven't recorded any expenses. Click the button below to add your first transaction.
            </p>
            <button onClick={openAddForm} className="mt-6 rounded-xl px-6 py-3 font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: "var(--primary-color)" }}>
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border shadow-sm" style={{ backgroundColor: "var(--card-background)", borderColor: "var(--border-color)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead style={{ backgroundColor: "var(--bg-main)" }}>
                  <tr>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Transaction</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Category</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Date</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>Amount</th>
                    <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-main)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{expense.title || "Expense"}</span>
                          {expense.notes && <span className="mt-1 max-w-[200px] truncate text-xs" style={{ color: "var(--text-secondary)" }}>{expense.notes}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: "var(--primary-light-bg)", color: "var(--primary-color)" }}>
                          {getCategoryName(expense.category_id)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                        {expense.expense_date ? new Date(`${String(expense.expense_date).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-6 py-5 text-right font-bold" style={{ color: "var(--text-primary)" }}>
                        ₹{Number(expense.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditForm(expense)} className="rounded-lg p-2 transition hover:bg-[var(--primary-light-bg)]" style={{ color: "var(--text-secondary)" }} title="Edit">
                            <FiEdit2 size={16} />
                          </button>
                          <button onClick={() => setDeleteTarget(expense)} className="rounded-lg p-2 transition hover:bg-[var(--danger-light-bg)]" style={{ color: "var(--text-secondary)" }} title="Delete">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setDeleteTarget(null); }}>
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border shadow-2xl animate-slide-in-up" style={{ backgroundColor: "var(--card-background)", borderColor: "var(--border-color)" }}>
            <div className="px-6 pb-5 pt-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: "var(--danger-light-bg)", color: "var(--danger-color)" }}>
                <FiTrash2 size={28} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Delete Expense?</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Are you sure you want to delete <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{deleteTarget.title || "this expense"}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t" style={{ borderColor: "var(--border-color)" }}>
              <button disabled={deleting} onClick={() => setDeleteTarget(null)} className="border-r px-4 py-4 font-semibold transition disabled:opacity-50" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-main)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                Cancel
              </button>
              <button disabled={deleting} onClick={confirmDelete} className="px-4 py-4 font-semibold transition disabled:opacity-50" style={{ color: "var(--danger-color)" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--danger-light-bg)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-up { animation: slideInUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default Expenses;