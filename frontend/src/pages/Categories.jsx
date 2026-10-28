import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

function getAuthHeaders() {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readResponse(response) {
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : `Request failed (${response.status}).`
    );
  }

  return data;
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: getAuthHeaders(),
      });

      const data = await readResponse(response);
      setCategories(Array.isArray(data) ? data : data?.items ?? []);
    } catch (err) {
      setError(err.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Close the confirmation dialog with Escape.
  useEffect(() => {
    if (!categoryToDelete) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && deletingId === null) {
        setCategoryToDelete(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [categoryToDelete, deletingId]);

  async function handleSubmit(event) {
    event.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      setError("Please enter a category name.");
      return;
    }

    if (
      categories.some(
        (category) => category.name?.toLowerCase() === name.toLowerCase()
      )
    ) {
      setError("This category already exists.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      });

      const createdCategory = await readResponse(response);

      setCategories((previous) => {
        if (previous.some((item) => item.id === createdCategory.id)) {
          return previous;
        }

        return [...previous, createdCategory].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });

      setCategoryName("");
      setSuccess("Category added successfully.");
    } catch (err) {
      setError(err.message || "Unable to add category.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!categoryToDelete || deletingId !== null) return;

    const category = categoryToDelete;

    setDeletingId(category.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/categories/${category.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      await readResponse(response);

      setCategories((previous) =>
        previous.filter((item) => item.id !== category.id)
      );

      setCategoryToDelete(null);
      setSuccess(`"${category.name}" was deleted successfully.`);
    } catch (err) {
      setError(err.message || "Unable to delete category.");
      setCategoryToDelete(null);
    } finally {
      setDeletingId(null);
    }
  }

  function cancelDelete() {
    if (deletingId !== null) return;
    setCategoryToDelete(null);
  }

  return (
    <main 
      className="categories-page min-h-screen transition-colors duration-300"
      style={{ 
        backgroundColor: "var(--bg-main)", 
        color: "var(--text-primary)" 
      }}
    >
      <header className="categories-header">
        <div>
          <p className="categories-eyebrow">EXPENSE MANAGEMENT</p>
          <h1>Categories</h1>
          <p className="categories-subtitle">
            Organize and manage the categories you use to track your spending.
          </p>
        </div>

        <div className="categories-count" aria-live="polite">
          <span className="categories-count-number">{categories.length}</span>
          <span className="categories-count-label">
            {categories.length === 1 ? "Category" : "Categories"}
          </span>
        </div>
      </header>

      {error && (
        <div className="categories-alert categories-alert-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="categories-alert categories-alert-success" role="status">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="categories-card">
        <div className="categories-card-heading">
          <div className="categories-icon categories-icon-add" aria-hidden="true">
            +
          </div>
          <div>
            <h2>Add a category</h2>
            <p>Create a category to organize your expenses.</p>
          </div>
        </div>

        <form className="categories-form" onSubmit={handleSubmit}>
          <div className="categories-input-group">
            <label htmlFor="category-name">Category name</label>
            <input
              id="category-name"
              type="text"
              placeholder="e.g. Food, Travel, Shopping"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              maxLength={100}
              autoComplete="off"
              required
            />
          </div>

          <button
            className="categories-primary-button"
            type="submit"
            disabled={submitting || !categoryName.trim()}
          >
            {submitting ? "Adding..." : "+ Add Category"}
          </button>
        </form>
      </section>

      <section className="categories-list-section">
        <div className="categories-list-heading">
          <div>
            <h2>Your categories</h2>
            <p>Manage the categories available in your account.</p>
          </div>

          <button
            type="button"
            className="categories-refresh-button"
            onClick={loadCategories}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="categories-empty-state" role="status">
            <span className="categories-spinner" aria-hidden="true" />
            <p>Loading your categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="categories-empty-state">
            <div className="categories-empty-icon" aria-hidden="true">◫</div>
            <h3>No categories found</h3>
            <p>Add your first category using the form above.</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <article className="category-item" key={category.id}>
                <div className="category-item-icon" aria-hidden="true">
                  {category.name?.trim()?.charAt(0)?.toUpperCase() || "C"}
                </div>

                <div className="category-item-details">
                  <h3>{category.name}</h3>
                  <p>Category #{category.id}</p>
                </div>

                <button
                  type="button"
                  className="category-delete-button"
                  onClick={() => setCategoryToDelete(category)}
                  disabled={deletingId !== null}
                  aria-label={`Delete ${category.name}`}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {categoryToDelete && (
        <div
          className="ios-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              deletingId === null
            ) {
              cancelDelete();
            }
          }}
        >
          <section
            className="ios-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
          >
            <div className="ios-delete-icon" aria-hidden="true">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
              </svg>
            </div>

            <h2 id="delete-modal-title">Delete Category?</h2>

            <p id="delete-modal-description">
              Are you sure you want to delete{" "}
              <strong>{categoryToDelete.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="ios-modal-actions">
              <button
                type="button"
                className="ios-cancel-button"
                onClick={cancelDelete}
                disabled={deletingId !== null}
              >
                Cancel
              </button>

              <button
                type="button"
                className="ios-confirm-delete-button"
                onClick={confirmDelete}
                disabled={deletingId !== null}
                autoFocus
              >
                {deletingId === categoryToDelete.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Categories;