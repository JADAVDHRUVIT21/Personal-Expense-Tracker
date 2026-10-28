import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCreditCard,
  FiDollarSign,
  FiTarget,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getExpenses } from "../services/expenseService";
import { getCategories } from "../services/categoryService";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getLastSixMonths = () => {
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - 5 + index,
      1
    );

    return {
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      month: date.toLocaleDateString("en-IN", {
        month: "short",
      }),
      expenses: 0,
    };
  });
};

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [expensesData, categoriesData] = await Promise.all([
        getExpenses(),
        getCategories(),
      ]);

      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your dashboard. Please check your login and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => Number(item.id) === Number(categoryId)
    );

    return category?.name || `Category #${categoryId ?? "—"}`;
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  const monthlyExpenses = expenses.reduce((total, expense) => {
    if (!expense.expense_date) return total;

    const date = new Date(`${expense.expense_date}T00:00:00`);

    if (
      date.getFullYear() === currentYear &&
      date.getMonth() === currentMonth
    ) {
      return total + Number(expense.amount || 0);
    }

    return total;
  }, 0);

  const monthlyData = getLastSixMonths().map((monthData) => {
    const total = expenses.reduce((sum, expense) => {
      if (!expense.expense_date) return sum;

      const date = new Date(`${expense.expense_date}T00:00:00`);

      if (
        date.getFullYear() === monthData.year &&
        date.getMonth() === monthData.monthIndex
      ) {
        return sum + Number(expense.amount || 0);
      }

      return sum;
    }, 0);

    return { ...monthData, expenses: total };
  });

  const recentTransactions = [...expenses]
    .sort((a, b) => {
      const dateComparison =
        new Date(b.expense_date || 0).getTime() -
        new Date(a.expense_date || 0).getTime();

      if (dateComparison !== 0) return dateComparison;

      return Number(b.id || 0) - Number(a.id || 0);
    })
    .slice(0, 5);

  const summaryCards = [
    {
      title: "Total Expenses",
      amount: formatCurrency(totalExpenses),
      note: `${expenses.length} recorded transaction${
        expenses.length === 1 ? "" : "s"
      }`,
      icon: FiDollarSign,
      iconBg: "var(--primary-light-bg)",
      iconColor: "var(--primary-color)",
    },
    {
      title: "Monthly Expenses",
      amount: formatCurrency(monthlyExpenses),
      note: now.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
      icon: FiCreditCard,
      iconBg: "rgba(59, 130, 246, 0.15)",
      iconColor: "#3b82f6",
    },
    {
      title: "Recorded Transactions",
      amount: String(expenses.length),
      note: "Across all recorded dates",
      icon: FiTarget,
      iconBg: "rgba(16, 185, 129, 0.15)",
      iconColor: "#10b981",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div 
          className="flex items-center gap-3 text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          <FiRefreshCw
            className="animate-spin text-violet-600"
            size={20}
          />
          Loading your financial overview...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="mx-auto max-w-2xl rounded-2xl border p-6 shadow-sm"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--danger-color)",
        }}
      >
        <div className="flex items-start gap-3">
          <FiAlertCircle
            className="mt-0.5"
            style={{ color: "var(--danger-color)" }}
            size={22}
          />

          <div className="flex-1">
            <h2 
              className="font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Couldn't load your dashboard
            </h2>

            <p 
              className="mt-2 text-sm leading-6"
              style={{ color: "var(--text-secondary)" }}
            >
              {error}
            </p>

            <button
              type="button"
              onClick={fetchDashboardData}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition"
              style={{ backgroundColor: "var(--primary-color)" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--primary-color)"}
            >
              <FiRefreshCw size={16} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p 
            className="text-sm font-semibold"
            style={{ color: "var(--primary-color)" }}
          >
            YOUR FINANCIAL OVERVIEW
          </p>

          <h1 
            className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            Dashboard
          </h1>

          <p 
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Track your spending and manage your money in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 self-start rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm transition"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary-color)";
            e.currentTarget.style.color = "var(--primary-color)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-color)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <FiRefreshCw size={16} />
          Refresh data
        </button>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p 
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {card.title}
                  </p>

                  <h2 
                    className="mt-3 break-words text-2xl font-extrabold tracking-tight sm:text-3xl"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {card.amount}
                  </h2>
                </div>

                <div
                  className="shrink-0 rounded-xl p-3"
                  style={{
                    backgroundColor: card.iconBg,
                    color: card.iconColor
                  }}
                >
                  <Icon size={22} />
                </div>
              </div>

              <p 
                className="mt-5 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {card.note}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
        <article 
          className="rounded-2xl border p-5 shadow-sm sm:p-6 2xl:col-span-2"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Spending Overview
              </h2>

              <p 
                className="mt-1 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Your actual expenses over the last six months
              </p>
            </div>

            <span 
              className="w-fit rounded-lg px-3 py-2 text-xs font-semibold"
              style={{
                backgroundColor: "var(--primary-light-bg)",
                color: "var(--primary-color)"
              }}
            >
              Last 6 months
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 8, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="expenseFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--primary-color)"
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary-color)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="var(--border-color)"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Expenses",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--card-background)",
                    color: "var(--text-primary)",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  }}
                  itemStyle={{ color: "var(--text-primary)" }}
                />

                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="var(--primary-color)"
                  strokeWidth={3}
                  fill="url(#expenseFill)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article 
          className="rounded-2xl border p-5 shadow-sm sm:p-6"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--border-color)",
          }}
        >
          <h2 
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Spending Tips
          </h2>

          <p 
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Simple ways to manage your money
          </p>

          <div className="mt-6 space-y-5">
            <div 
              className="rounded-xl p-4"
              style={{ backgroundColor: "var(--primary-light-bg)" }}
            >
              <div 
                className="flex items-center gap-2"
                style={{ color: "var(--primary-color)" }}
              >
                <FiTarget size={19} />
                <h3 className="text-sm font-bold">Set a budget</h3>
              </div>

              <p 
                className="mt-2 text-sm leading-6"
                style={{ color: "var(--text-secondary)" }}
              >
                Set monthly limits for categories to help control your spending.
              </p>
            </div>

            <div 
              className="rounded-xl p-4"
              style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
            >
              <div 
                className="flex items-center gap-2"
                style={{ color: "var(--success-color)" }}
              >
                <FiTrendingUp size={19} />
                <h3 className="text-sm font-bold">
                  Review your trends
                </h3>
              </div>

              <p 
                className="mt-2 text-sm leading-6"
                style={{ color: "var(--text-secondary)" }}
              >
                Review your actual monthly expenses to understand your spending habits.
              </p>
            </div>

            <div 
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--border-color)" }}
            >
              <p 
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                All-time spending
              </p>

              <p 
                className="mt-2 text-2xl font-extrabold"
                style={{ color: "var(--text-primary)" }}
              >
                {formatCurrency(totalExpenses)}
              </p>

              <p 
                className="mt-1 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Based on your recorded expenses
              </p>
            </div>
          </div>
        </article>
      </section>

      <section 
        className="overflow-hidden rounded-2xl border shadow-sm"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--border-color)",
        }}
      >
        <div 
          className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center sm:p-6"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div>
            <h2 
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Recent Transactions
            </h2>

            <p 
              className="mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Your latest recorded expenses
            </p>
          </div>

          <Link
            to="/expenses"
            className="text-sm font-bold transition hover:opacity-80"
            style={{ color: "var(--primary-color)" }}
          >
            View all expenses →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div 
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: "var(--primary-light-bg)",
                color: "var(--primary-color)"
              }}
            >
              <FiCreditCard size={25} />
            </div>

            <h3 
              className="mt-4 font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              No expenses yet
            </h3>

            <p 
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Add your first expense to see your transactions here.
            </p>

            <Link
              to="/expenses"
              className="mt-5 inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition"
              style={{ backgroundColor: "var(--primary-color)" }}
            >
              Go to expenses
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead style={{ backgroundColor: "var(--bg-main)" }}>
                <tr 
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>

              <tbody 
                className="divide-y"
                style={{ borderColor: "var(--border-color)" }}
              >
                {recentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-main)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span 
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: "var(--primary-light-bg)",
                            color: "var(--primary-color)"
                          }}
                        >
                          <FiCreditCard size={18} />
                        </span>

                        <span 
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {transaction.title}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span 
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--bg-main)",
                          color: "var(--text-secondary)"
                        }}
                      >
                        {getCategoryName(transaction.category_id)}
                      </span>
                    </td>

                    <td 
                      className="whitespace-nowrap px-6 py-4 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {formatDate(transaction.expense_date)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span 
                        className="text-sm font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        −{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;