import { useCallback, useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiChevronDown,
  FiCheck,
  FiCalendar,
  FiTarget,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";

import api from "../services/api";
import { getCategories } from "../services/categoryService";
import { getExpenses } from "../services/expenseService";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
};

const emptyForm = {
  category_id: "",
  amount: "",
  month: getCurrentMonth(),
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getMonthKey = (value) => {
  if (!value) return "";

  // Handles YYYY-MM, YYYY-MM-DD and ISO date-time strings.
  const text = String(value).trim();
  const match = text.match(/^(\d{4})-(\d{2})/);

  return match ? `${match[1]}-${match[2]}` : "";
};

const formatMonth = (value) => {
  const monthKey = getMonthKey(value);
  if (!monthKey) return "—";

  const [year, month] = monthKey.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    1
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

const getErrorMessage = (err, fallback) => {
  const detail = err.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(", ") || fallback;
  }

  return fallback;
};

const getCategoryId = (item) =>
  item?.category_id ??
  item?.category?.id ??
  item?.categoryId ??
  null;

const getBudgetMonth = (budget) =>
  getMonthKey(
    budget?.month ??
    budget?.budget_month ??
    budget?.month_date
  );

const getExpenseMonth = (expense) =>
  getMonthKey(
    expense?.expense_date ??
    expense?.date ??
    expense?.expenseDate
  );

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        api.get("/budgets"),
        getCategories(),
        getExpenses(),
      ]);

      const [budgetResult, categoryResult, expenseResult] = results;

      if (budgetResult.status === "rejected") {
        throw budgetResult.reason;
      }

      const budgetData = budgetResult.value.data;

      const categoryData =
        categoryResult.status === "fulfilled"
          ? categoryResult.value
          : [];

      const expenseData =
        expenseResult.status === "fulfilled"
          ? expenseResult.value
          : [];

      setBudgets(normalizeList(budgetData));
      setCategories(normalizeList(categoryData));
      setExpenses(normalizeList(expenseData));

      if (
        categoryResult.status === "rejected" ||
        expenseResult.status === "rejected"
      ) {
        setError(
          "Budgets loaded, but categories or expenses could not be loaded. Spending totals may be incomplete. Check the API response."
        );
      }
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load budgets. Please try again.")
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

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm, month: getCurrentMonth() });
    setFormError("");
    setCategoryPickerOpen(false);
    setShowForm(true);
  };

  const openEditForm = (budget) => {
    setEditingId(budget.id);

    setForm({
      category_id: String(getCategoryId(budget) ?? ""),
      amount: String(budget.amount ?? ""),
      month:
        getBudgetMonth(budget) || getCurrentMonth(),
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const amount = Number(form.amount);

    if (!form.category_id) {
      setFormError("Please select a category.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter a budget amount greater than zero.");
      return;
    }

    if (!/^\d{4}-\d{2}$/.test(form.month)) {
      setFormError("Please select a valid budget month.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        category_id: Number(form.category_id),
        amount,
        month: `${form.month}-01`,
      };

      if (editingId !== null) {
        await api.patch(`/budgets/${editingId}`, payload);
      } else {
        await api.post("/budgets", payload);
      }

      setShowForm(false);
      setEditingId(null);
      setCategoryPickerOpen(false);
      setForm({ ...emptyForm, month: getCurrentMonth() });

      await fetchData();
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          `Unable to ${
            editingId !== null ? "update" : "create"
          } the budget. Check the required fields and try again.`
        )
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
      await api.delete(`/budgets/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to delete this budget.")
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryName = (budget) => {
    const categoryId = getCategoryId(budget);

    const category = categories.find(
      (item) => Number(item.id) === Number(categoryId)
    );

    return (
      budget?.category?.name ||
      category?.name ||
      `Category #${categoryId ?? "—"}`
    );
  };

  // Sum expenses only when both category and month match the budget.
  const getSpentAmount = (budget) => {
    const categoryId = getCategoryId(budget);
    const budgetMonth = getBudgetMonth(budget);

    if (categoryId == null || !budgetMonth) return 0;

    return expenses.reduce((total, expense) => {
      const expenseCategoryId = getCategoryId(expense);
      const expenseMonth = getExpenseMonth(expense);

      if (
        expenseCategoryId != null &&
        Number(expenseCategoryId) === Number(categoryId) &&
        expenseMonth === budgetMonth
      ) {
        return total + Number(expense.amount ?? 0);
      }

      return total;
    }, 0);
  };

  const selectedCategory = categories.find(
    (category) => String(category.id) === String(form.category_id)
  );

  const currentMonth = getCurrentMonth();

  const currentMonthBudgets = budgets.filter(
    (budget) => getBudgetMonth(budget) === currentMonth
  );

  const currentMonthSpent = currentMonthBudgets.reduce(
    (sum, budget) => sum + getSpentAmount(budget),
    0
  );

  const currentMonthLimit = currentMonthBudgets.reduce(
    (sum, budget) => sum + Number(budget.amount || 0),
    0
  );

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-main)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Budgets
            </h1>
            <p 
              className="mt-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Plan your spending and stay in control of your money.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "var(--primary-color)" }}
          >
            <FiPlus size={19} />
            Create Budget
          </button>
        </div>

        {error && (
          <div 
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border p-4 text-sm"
            style={{
              backgroundColor: "var(--danger-light-bg)",
              borderColor: "var(--danger-color)",
              color: "var(--danger-color)"
            }}
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="rounded-lg p-1 hover:bg-black/10"
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div 
            className="rounded-2xl border p-5 shadow-sm"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center justify-between">
              <p 
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Total Budgets
              </p>
              <span 
                className="rounded-xl p-3"
                style={{
                  backgroundColor: "var(--primary-light-bg)",
                  color: "var(--primary-color)"
                }}
              >
                <FiTarget size={21} />
              </span>
            </div>
            <p 
              className="mt-4 text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {loading ? "—" : budgets.length}
            </p>
            <p 
              className="mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              All saved budgets
            </p>
          </div>

          <div 
            className="rounded-2xl border p-5 shadow-sm"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center justify-between">
              <p 
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                This Month's Limit
              </p>
              <span 
                className="rounded-xl p-3"
                style={{
                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                  color: "#6366f1"
                }}
              >
                <FiCalendar size={21} />
              </span>
            </div>
            <p 
              className="mt-4 text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {formatCurrency(currentMonthLimit)}
            </p>
            <p 
              className="mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {formatMonth(currentMonth)}
            </p>
          </div>

          <div 
            className="rounded-2xl border p-5 shadow-sm"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center justify-between">
              <p 
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Tracked Spending
              </p>
              <span 
                className="rounded-xl p-3"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981"
                }}
              >
                <FiTrendingUp size={21} />
              </span>
            </div>
            <p 
              className="mt-4 text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {formatCurrency(currentMonthSpent)}
            </p>
            <p 
              className="mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Against this month's category budgets
            </p>
          </div>
        </div>

        {showForm && (
          <div 
            className="mb-8 rounded-2xl border p-5 shadow-sm sm:p-6"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {editingId !== null ? "Edit Budget" : "Create a Budget"}
                </h2>
                <p 
                  className="mt-1 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Set a spending limit for a category and month.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close budget form"
                className="rounded-full p-2 transition disabled:opacity-50"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-main)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <FiX size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="relative">
                  <label
                    htmlFor="budget-category-picker"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Category
                  </label>
                  <button
                    id="budget-category-picker"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={categoryPickerOpen}
                    onClick={() => setCategoryPickerOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left outline-none transition focus:ring-4"
                    style={{
                      backgroundColor: "var(--input-background)",
                      borderColor: categoryPickerOpen ? "var(--primary-color)" : "var(--border-color)",
                      "--tw-ring-color": "rgba(59, 130, 246, 0.2)"
                    }}
                  >
                    <span
                      style={{
                        color: selectedCategory ? "var(--text-primary)" : "var(--text-secondary)",
                        fontWeight: selectedCategory ? 500 : 400
                      }}
                    >
                      {selectedCategory?.name || "Choose category"}
                    </span>
                    <FiChevronDown
                      size={18}
                      className={`ml-2 shrink-0 transition-transform ${
                        categoryPickerOpen ? "rotate-180" : ""
                      }`}
                      style={{ color: "var(--text-secondary)" }}
                    />
                  </button>

                  {categoryPickerOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close category picker"
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setCategoryPickerOpen(false)}
                      />
                      <div 
                        className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border p-2 shadow-xl"
                        style={{
                          backgroundColor: "var(--card-background)",
                          borderColor: "var(--border-color)",
                        }}
                      >
                        <p 
                          className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Select category
                        </p>
                        <div
                          role="listbox"
                          aria-label="Budget categories"
                          className="max-h-56 overflow-y-auto"
                        >
                          {categories.length ? (
                            categories.map((item) => {
                              const selected =
                                String(item.id) === String(form.category_id);

                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  role="option"
                                  aria-selected={selected}
                                  onClick={() => {
                                    setForm((previous) => ({
                                      ...previous,
                                      category_id: String(item.id),
                                    }));
                                    setCategoryPickerOpen(false);
                                    setFormError("");
                                  }}
                                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition"
                                  style={{
                                    backgroundColor: selected ? "var(--primary-light-bg)" : "transparent",
                                    color: selected ? "var(--primary-color)" : "var(--text-primary)",
                                    fontWeight: selected ? 600 : 400
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!selected) e.currentTarget.style.backgroundColor = "var(--bg-main)";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!selected) e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <span>{item.name}</span>
                                  {selected && (
                                    <FiCheck
                                      size={18}
                                      style={{ color: "var(--primary-color)" }}
                                    />
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <p 
                              className="px-3 py-4 text-sm"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              No categories found. Create a category first.
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="budget-amount"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Budget Amount (₹)
                  </label>
                  <input
                    id="budget-amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Enter budget amount"
                    required
                    className="w-full rounded-2xl border px-4 py-3.5 outline-none transition focus:ring-4"
                    style={{
                      backgroundColor: "var(--input-background)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                      "--tw-ring-color": "rgba(59, 130, 246, 0.2)"
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="budget-month"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Budget Month
                  </label>
                  <input
                    id="budget-month"
                    name="month"
                    type="month"
                    value={form.month}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border px-4 py-3.5 outline-none transition focus:ring-4"
                    style={{
                      backgroundColor: "var(--input-background)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-primary)",
                      colorScheme: "light dark",
                      "--tw-ring-color": "rgba(59, 130, 246, 0.2)"
                    }}
                  />
                </div>
              </div>

              {formError && (
                <div 
                  className="rounded-xl border p-3 text-sm"
                  style={{
                    backgroundColor: "var(--danger-light-bg)",
                    borderColor: "var(--danger-color)",
                    color: "var(--danger-color)"
                  }}
                >
                  {formError}
                </div>
              )}

              <div 
                className="flex flex-wrap gap-3 border-t pt-5"
                style={{ borderColor: "var(--border-color)" }}
              >
                <button
                  type="submit"
                  disabled={saving || categories.length === 0}
                  className="rounded-xl px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary-color)" }}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Create Budget"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border px-6 py-3 font-semibold transition disabled:opacity-50"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-main)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div 
          className="rounded-2xl border p-5 shadow-sm sm:p-6"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Your Budgets
              </h2>
              <p 
                className="mt-1 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Track spending for each category and month.
              </p>
            </div>
            <span 
              className="rounded-full px-3 py-1.5 text-sm font-semibold"
              style={{
                backgroundColor: "var(--primary-light-bg)",
                color: "var(--primary-color)"
              }}
            >
              {budgets.length} {budgets.length === 1 ? "budget" : "budgets"}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div 
                className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
                style={{
                  borderColor: "var(--border-color)",
                  borderTopColor: "var(--primary-color)"
                }}
              />
              <p style={{ color: "var(--text-secondary)" }}>Loading budgets...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div 
              className="rounded-2xl border-2 border-dashed px-6 py-12 text-center"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div 
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: "var(--primary-light-bg)",
                  color: "var(--primary-color)"
                }}
              >
                <FiTarget size={25} />
              </div>
              <h3 
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                No budgets created yet
              </h3>
              <p 
                className="mt-2 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Create your first budget to start tracking your spending.
              </p>
              <button
                type="button"
                onClick={openAddForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                <FiPlus size={18} />
                Create Your First Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {budgets.map((budget) => {
                const limit = Number(budget.amount || 0);
                const spent = getSpentAmount(budget);
                const remaining = limit - spent;
                const progress = limit > 0 ? (spent / limit) * 100 : 0;
                const progressWidth = Math.min(Math.max(progress, 0), 100);
                const exceeded = spent > limit;
                const warning = progress >= 90 && !exceeded;

                return (
                  <div
                    key={budget.id}
                    className="rounded-2xl border p-5 transition duration-200 hover:shadow-md"
                    style={{
                      backgroundColor: "var(--card-background)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 
                          className="truncate text-lg font-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {getCategoryName(budget)}
                        </h3>
                        <p 
                          className="mt-1 flex items-center gap-1.5 text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <FiCalendar size={14} />
                          {formatMonth(getBudgetMonth(budget))}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(budget)}
                          aria-label={`Edit ${getCategoryName(budget)} budget`}
                          title="Edit budget"
                          className="rounded-xl border p-2.5 transition"
                          style={{
                            borderColor: "var(--border-color)",
                            color: "var(--primary-color)"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-light-bg)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <FiEdit2 size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(budget)}
                          aria-label={`Delete ${getCategoryName(budget)} budget`}
                          title="Delete budget"
                          className="rounded-xl border p-2.5 transition"
                          style={{
                            borderColor: "var(--border-color)",
                            color: "var(--danger-color)"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--danger-light-bg)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <FiTrash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-2 flex items-end justify-between gap-2">
                      <div>
                        <p 
                          className="text-xs font-medium uppercase tracking-wide"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Spent
                        </p>
                        <p 
                          className="mt-1 text-xl font-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {formatCurrency(spent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p 
                          className="text-xs font-medium uppercase tracking-wide"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Budget limit
                        </p>
                        <p 
                          className="mt-1 font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {formatCurrency(limit)}
                        </p>
                      </div>
                    </div>

                    <div
                      className="mt-4 h-2.5 overflow-hidden rounded-full"
                      style={{ backgroundColor: "var(--bg-main)" }}
                      role="progressbar"
                      aria-label={`${getCategoryName(budget)} budget used`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progressWidth)}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progressWidth}%`,
                          backgroundColor: exceeded ? "#ef4444" : warning ? "#f59e0b" : "#10b981"
                        }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span
                        className="font-semibold"
                        style={{ 
                          color: exceeded ? "#ef4444" : warning ? "#f59e0b" : "#10b981" 
                        }}
                      >
                        {progress.toFixed(1)}% used
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {exceeded
                          ? `${formatCurrency(Math.abs(remaining))} over`
                          : `${formatCurrency(remaining)} left`}
                      </span>
                    </div>

                    {(exceeded || warning) && (
                      <div
                        className="mt-4 flex items-start gap-2 rounded-xl p-3 text-sm"
                        style={{
                          backgroundColor: exceeded ? "var(--danger-light-bg)" : "rgba(245, 158, 11, 0.1)",
                          color: exceeded ? "var(--danger-color)" : "#d97706"
                        }}
                      >
                        <FiAlertCircle
                          size={17}
                          className="mt-0.5 shrink-0"
                        />
                        <p>
                          {exceeded
                            ? "You have exceeded this budget."
                            : "You are approaching your budget limit."}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-budget-title"
            aria-describedby="delete-budget-description"
            className="w-full max-w-sm overflow-hidden rounded-3xl border shadow-2xl"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="px-6 pb-5 pt-7 text-center">
              <div 
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "var(--danger-light-bg)",
                  color: "var(--danger-color)"
                }}
              >
                <FiTrash2 size={25} />
              </div>
              <h2
                id="delete-budget-title"
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Delete Budget?
              </h2>
              <p
                id="delete-budget-description"
                className="mt-2 text-sm leading-6"
                style={{ color: "var(--text-secondary)" }}
              >
                Are you sure you want to delete the{" "}
                <span 
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {getCategoryName(deleteTarget)}
                </span>{" "}
                budget for{" "}
                <span 
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {formatMonth(getBudgetMonth(deleteTarget))}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div 
              className="grid grid-cols-2 border-t"
              style={{ borderColor: "var(--border-color)" }}
            >
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="border-r px-4 py-4 font-semibold transition disabled:opacity-50"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-secondary)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-main)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-4 py-4 font-semibold transition disabled:opacity-50"
                style={{ color: "var(--danger-color)" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--danger-light-bg)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;