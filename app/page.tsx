"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Restaurant = {
  restaurantId: string;
  name: string;
  location: string;
  category: string;
  priceRange: string;
  imageUrl: string;
};

type User = {
  userId: string;
  email: string;
  name: string;
};

type Review = {
  restaurantId: string;
  createdAt: string;
  reviewId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load user from localStorage, redirect to login if missing
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(stored) as User;
    setUser(parsed);
  }, [router]);

  // Load restaurants from API
  useEffect(() => {
    async function loadRestaurants() {
      try {
        const res = await fetch("/api/restaurants");
        const data = await res.json();
        setRestaurants(data.items || []);
        if (data.items && data.items.length > 0) {
          setSelectedId(data.items[0].restaurantId);
        }
      } catch (e) {
        console.error("Failed to load restaurants", e);
      } finally {
        setLoadingRestaurants(false);
      }
    }
    loadRestaurants();
  }, []);

  // Load reviews whenever selected restaurant changes
  useEffect(() => {
    if (!selectedId) return;
    async function loadReviews() {
      setLoadingReviews(true);
      try {
        const res = await fetch(`/api/reviews?restaurantId=${selectedId}`);
        const data = await res.json();
        setReviews((data.items || []) as Review[]);
      } catch (e) {
        console.error("Failed to load reviews", e);
      } finally {
        setLoadingReviews(false);
      }
    }
    loadReviews();
  }, [selectedId]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    router.push("/login");
  }

  const selected =
    restaurants.find((r) => r.restaurantId === selectedId) || null;

  const averageRating =
    reviews.length === 0
      ? null
      : reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
        reviews.length;

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedId) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: selectedId,
          rating,
          comment,
          userId: user.userId,
          userName: user.name || user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to submit review");
        return;
      }

      setReviews((prev) => [data as Review, ...prev]);
      setComment("");
      setRating(5);
    } catch (err) {
      setErrorMsg("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1e293b 0, #020617 45%, #020617 100%)",
        color: "#e5e7eb",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.9rem 1.8rem",
          borderBottom: "1px solid rgba(148,163,184,0.35)",
          backdropFilter: "blur(14px)",
          backgroundColor: "rgba(15,23,42,0.9)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "0.9rem",
              background:
                "conic-gradient(from 160deg, #22c55e, #0ea5e9, #22c55e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              color: "#020617",
            }}
          >
            R
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              Restaurant Reviews
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              Cloud-backed dining feedback
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          {user && (
            <div style={{ textAlign: "right", fontSize: "0.8rem" }}>
              <div>{user.name || user.email}</div>
              <div style={{ color: "#9ca3af" }}>{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "9999px",
              border: "1px solid rgba(148,163,184,0.7)",
              backgroundColor: "transparent",
              color: "#e5e7eb",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1.6fr)",
          gap: "1rem",
          padding: "1.2rem 1.4rem 1.6rem",
        }}
      >
        {/* Left: Restaurants list */}
        <section
          style={{
            borderRadius: "1rem",
            border: "1px solid rgba(148,163,184,0.4)",
            background:
              "radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 55%), rgba(15,23,42,0.96)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.7rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.2rem",
            }}
          >
            <h2 style={{ fontSize: "1rem" }}>Restaurants</h2>
          </div>

          {loadingRestaurants ? (
            <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              Loading restaurants...
            </div>
          ) : restaurants.length === 0 ? (
            <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              No restaurants found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {restaurants.map((r) => {
                const isSelected = r.restaurantId === selectedId;
                return (
                  <button
                    key={r.restaurantId}
                    onClick={() => setSelectedId(r.restaurantId)}
                    style={{
                      textAlign: "left",
                      borderRadius: "0.9rem",
                      border: isSelected
                        ? "1px solid rgba(56,189,248,0.9)"
                        : "1px solid rgba(148,163,184,0.4)",
                      padding: "0.5rem",
                      backgroundColor: isSelected
                        ? "rgba(15,23,42,0.95)"
                        : "rgba(15,23,42,0.9)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: 90,
                        borderRadius: "0.7rem",
                        overflow: "hidden",
                        backgroundColor: "#020617",
                        marginBottom: "0.2rem",
                      }}
                    >
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        marginBottom: "0.1rem",
                      }}
                    >
                      {r.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{r.location}</span>
                      <span>{r.category}</span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#a5b4fc",
                        marginTop: "0.15rem",
                      }}
                    >
                      Price: {r.priceRange}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Details + reviews */}
        <section
          style={{
            borderRadius: "1rem",
            border: "1px solid rgba(148,163,184,0.4)",
            background:
              "radial-gradient(circle at top right, rgba(129,140,248,0.16), transparent 55%), rgba(15,23,42,0.96)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}
        >
          {selected ? (
            <>
              <div>
                <h2
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "0.2rem",
                  }}
                >
                  {selected.name}
                </h2>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#9ca3af",
                  }}
                >
                  {selected.category} • {selected.location} • Price{" "}
                  {selected.priceRange}
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#a5b4fc",
                    marginTop: "0.3rem",
                  }}
                >
                  {averageRating === null
                    ? "No reviews yet."
                    : `Average rating: ${averageRating.toFixed(
                        1
                      )} (${reviews.length} review${
                        reviews.length === 1 ? "" : "s"
                      })`}
                </p>
              </div>

              {/* Add review form */}
              {user && (
                <form
                  onSubmit={handleSubmitReview}
                  style={{
                    borderRadius: "0.8rem",
                    border: "1px solid rgba(148,163,184,0.5)",
                    padding: "0.7rem 0.8rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                    backgroundColor: "rgba(15,23,42,0.9)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                      }}
                    >
                      Add your review
                    </span>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      style={{
                        fontSize: "0.8rem",
                        borderRadius: "9999px",
                        border: "1px solid rgba(148,163,184,0.7)",
                                                backgroundColor: "rgba(15,23,42,0.95)",
                        color: "#e5e7eb",
                        padding: "0.2rem 0.6rem",
                      }}
                    >
                      {[5, 4, 3, 2, 1].map((v) => (
                        <option key={v} value={v}>
                          {v} ★
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    style={{
                      marginTop: "0.3rem",
                      width: "100%",
                      borderRadius: "0.6rem",
                      border: "1px solid rgba(148,163,184,0.6)",
                      backgroundColor: "rgba(15,23,42,0.95)",
                      color: "#e5e7eb",
                      fontSize: "0.85rem",
                      padding: "0.4rem 0.5rem",
                      resize: "vertical",
                    }}
                  />

                  {errorMsg && (
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#fca5a5",
                        marginTop: "0.1rem",
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      alignSelf: "flex-end",
                      marginTop: "0.3rem",
                      padding: "0.35rem 0.9rem",
                      borderRadius: "9999px",
                      border: "none",
                      backgroundColor: submitting ? "#6b7280" : "#22c55e",
                      color: "#020617",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit review"}
                  </button>
                </form>
              )}

              {/* Reviews list */}
              <div
                style={{
                  borderRadius: "0.8rem",
                  border: "1px solid rgba(148,163,184,0.4)",
                  padding: "0.6rem 0.7rem",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  maxHeight: 260,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.45rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.15rem",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    Recent reviews
                  </span>
                  {loadingReviews && (
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                      Loading...
                    </span>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    No reviews yet. Be the first to review this restaurant.
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.reviewId}
                      style={{
                        borderRadius: "0.6rem",
                        border: "1px solid rgba(148,163,184,0.45)",
                        padding: "0.4rem 0.5rem",
                        fontSize: "0.8rem",
                        backgroundColor: "rgba(15,23,42,0.95)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.15rem",
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>
                          {rev.userName || "Anonymous"}
                        </span>
                        <span style={{ color: "#facc15" }}>
                          {rev.rating} ★
                        </span>
                      </div>
                      {rev.comment && (
                        <div
                          style={{
                            color: "#d1d5db",
                            marginBottom: "0.15rem",
                          }}
                        >
                          {rev.comment}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#9ca3af",
                        }}
                      >
                        {new Date(rev.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              Select a restaurant on the left to view details and reviews.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

