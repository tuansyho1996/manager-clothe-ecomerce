"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  color: string;
};

const orders = [
  { id: "#SS-1048", customer: "Olivia Rhye", initials: "OR", color: "lavender", date: "Today, 10:42 am", total: 136, status: "Processing" },
  { id: "#SS-1047", customer: "Phoenix Baker", initials: "PB", color: "peach", date: "Today, 9:18 am", total: 98, status: "Shipped" },
  { id: "#SS-1046", customer: "Lana Steiner", initials: "LS", color: "blue", date: "Yesterday", total: 212, status: "Delivered" },
  { id: "#SS-1045", customer: "Demi Wilkinson", initials: "DW", color: "green", date: "Yesterday", total: 84, status: "Processing" },
];

const weeklySales = [
  { day: "Mon", value: 38 },
  { day: "Tue", value: 54 },
  { day: "Wed", value: 45 },
  { day: "Thu", value: 72 },
  { day: "Fri", value: 61 },
  { day: "Sat", value: 91 },
  { day: "Sun", value: 76 },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] ?? paths.grid}
    </svg>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [inventoryError, setInventoryError] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Could not load products.");
        }

        if (!cancelled) {
          setProducts(result.products as Product[]);
          setInventoryError("");
        }
      } catch (error) {
        if (!cancelled) {
          setInventoryError(error instanceof Error ? error.message : "Could not load products.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false);
        }
      }
    }

    void loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) =>
      `${product.name} ${product.category} ${product.sku}`.toLowerCase().includes(search.trim().toLowerCase()),
    ),
    [products, search],
  );

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name")).trim();
    const sku = String(formData.get("sku")).trim();
    const category = String(formData.get("category"));
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));

    setFormError("");
    setIsSavingProduct(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sku, category, price, stock }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Could not save this product.");
      }

      const product = result.product as Product;
      setProducts((current) => [product, ...current]);
      setShowProductForm(false);
      setNotice(`${product.name} saved to MongoDB`);
      window.setTimeout(() => setNotice(""), 3200);
      form.reset();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not save this product.");
    } finally {
      setIsSavingProduct(false);
    }
  }

  function exportReport() {
    const rows = [["Product", "SKU", "Category", "Price", "Stock"], ...products.map((product) => [
      product.name, product.sku, product.category, String(product.price), String(product.stock),
    ])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "sunday-studio-inventory.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Sunday Studio dashboard home">
          <span className="brand-mark">s.</span>
          <span className="brand-copy"><strong>sunday studio</strong><small>STORE ADMIN</small></span>
        </a>

        <div className="store-switcher">
          <span className="store-avatar">S</span>
          <span className="store-details"><strong>Sunday Studio</strong><small>Online store</small></span>
          <span className="switcher-dots">···</span>
        </div>

        <span className="nav-label">WORKSPACE</span>
        <nav className="side-nav" aria-label="Dashboard sections">
          <a className="nav-item active" href="#overview"><Icon name="grid" />Overview</a>
          <a className="nav-item" href="#orders"><Icon name="bag" />Orders<span className="nav-count">8</span></a>
          <a className="nav-item" href="#inventory"><Icon name="box" />Products</a>
          <a className="nav-item" href="#customers"><Icon name="users" />Customers</a>
          <a className="nav-item" href="#analytics"><Icon name="chart" />Analytics</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-spark">✳</span>
            <strong>Need a hand?</strong>
            <p>We&apos;re here to help your store grow.</p>
            <a href="mailto:hello@sunday.studio">Visit help center <span>↗</span></a>
          </div>
          <a className="nav-item settings-link" href="#settings"><Icon name="settings" />Settings</a>
          <div className="account">
            <span className="account-avatar">JM</span>
            <span className="account-copy"><strong>Jamie Morgan</strong><small>Store owner</small></span>
            <span className="switcher-dots">···</span>
          </div>
        </div>
      </aside>

      <main className="main-panel" id="overview">
        <header className="topbar">
          <div className="breadcrumb"><span>Store</span><Icon name="chevron" size={14} /><strong>Overview</strong></div>
          <div className="topbar-actions">
            <label className="global-search">
              <Icon name="search" size={17} />
              <input aria-label="Search dashboard" placeholder="Search anything..." />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button notification-button" aria-label="Notifications" type="button"><Icon name="bell" /><i /></button>
            <span className="topbar-divider" />
            <button className="store-link" type="button" onClick={() => setNotice("Your storefront preview is coming soon")}>View store <Icon name="arrow" size={15} /></button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="date-line">YOUR STORE AT A GLANCE <span>✳</span></p>
              <h1>Good morning, Jamie <span>☀</span></h1>
              <p className="welcome-subtitle">Here&apos;s what&apos;s happening with your store today.</p>
            </div>
            <button className="button button-outline" onClick={exportReport} type="button"><Icon name="download" size={16} />Export report</button>
          </section>

          <section className="stat-grid" aria-label="Store performance">
            <article className="stat-card">
              <div className="stat-heading"><span>Total sales</span><span className="stat-icon mint"><Icon name="chart" size={17} /></span></div>
              <strong className="stat-value">$12,486<span className="stat-cents">.80</span></strong>
              <div className="stat-foot"><span className="trend up">↗ 12.8%</span><span>vs. last month</span></div>
              <span className="stat-sparkline spark-green" aria-hidden="true">▁▂▁▃▂▄▃▅▄▆▅▇</span>
            </article>
            <article className="stat-card">
              <div className="stat-heading"><span>Orders</span><span className="stat-icon peach"><Icon name="bag" size={17} /></span></div>
              <strong className="stat-value">184</strong>
              <div className="stat-foot"><span className="trend up">↗ 8.2%</span><span>vs. last month</span></div>
              <span className="stat-sparkline spark-orange" aria-hidden="true">▁▂▃▂▄▃▅▄▅▆▄▇</span>
            </article>
            <article className="stat-card">
              <div className="stat-heading"><span>Average order value</span><span className="stat-icon lilac"><span>$</span></span></div>
              <strong className="stat-value">$67<span className="stat-cents">.86</span></strong>
              <div className="stat-foot"><span className="trend up">↗ 4.3%</span><span>vs. last month</span></div>
              <span className="stat-sparkline spark-purple" aria-hidden="true">▁▂▂▃▂▄▃▃▅▄▆▇</span>
            </article>
            <article className="stat-card">
              <div className="stat-heading"><span>Store visitors</span><span className="stat-icon blue"><Icon name="users" size={17} /></span></div>
              <strong className="stat-value">8,249</strong>
              <div className="stat-foot"><span className="trend down">↘ 2.4%</span><span>vs. last month</span></div>
              <span className="stat-sparkline spark-blue" aria-hidden="true">▁▃▂▄▃▅▄▃▅▄▆▅</span>
            </article>
          </section>

          <section className="overview-grid" id="analytics">
            <article className="panel sales-panel">
              <div className="panel-heading">
                <div><h2>Sales overview</h2><p>Your revenue at a glance</p></div>
                <select aria-label="Sales chart time period" defaultValue="7 days">
                  <option>7 days</option><option>30 days</option><option>12 months</option>
                </select>
              </div>
              <div className="chart-summary"><strong>$3,248.00</strong><span className="trend up">↗ 14.6%</span><small>compared to last week</small></div>
              <div className="chart" role="img" aria-label="Bar chart showing sales from Monday to Sunday, highest on Saturday">
                <div className="chart-y-labels"><span>$1,000</span><span>$750</span><span>$500</span><span>$250</span><span>$0</span></div>
                <div className="chart-body">
                  <div className="chart-gridlines"><i /><i /><i /><i /><i /></div>
                  {weeklySales.map(({ day, value }, index) => (
                    <div className="chart-column" key={day}>
                      <span className={`chart-bar${index === 5 ? " highlighted" : ""}`} style={{ height: `${value}%` }} />
                      <span className="chart-day">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="panel best-sellers-panel">
              <div className="panel-heading">
                <div><h2>Best sellers</h2><p>Your most-loved pieces</p></div>
                <a className="subtle-link" href="#inventory">View all <Icon name="arrow" size={14} /></a>
              </div>
              <div className="seller-list">
                {[
                  { rank: "01", name: "The Everyday Tee", category: "Tops · Cloud white", sold: 86, color: "#e8d8c8" },
                  { rank: "02", name: "Sunday Knit", category: "Knitwear · Oatmeal", sold: 64, color: "#d8d1c5" },
                  { rank: "03", name: "Relaxed Linen Shirt", category: "Tops · Soft blue", sold: 52, color: "#cad9dc" },
                  { rank: "04", name: "The Weekend Trouser", category: "Bottoms · Warm sand", sold: 38, color: "#d8c6ae" },
                ].map((item) => (
                  <div className="seller-row" key={item.rank}>
                    <span className="seller-rank">{item.rank}</span>
                    <span className="product-swatch" style={{ backgroundColor: item.color }} />
                    <span className="seller-info"><strong>{item.name}</strong><small>{item.category}</small></span>
                    <span className="seller-sold"><strong>{item.sold}</strong><small>sold</small></span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="panel orders-panel" id="orders">
            <div className="panel-heading">
              <div><h2>Recent orders <span className="count-pill">8 new</span></h2><p>Keep track of what&apos;s headed out the door.</p></div>
              <a className="subtle-link" href="#orders">View all orders <Icon name="arrow" size={14} /></a>
            </div>
            <div className="table-scroll">
              <table className="orders-table">
                <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>STATUS</th><th>TOTAL</th><th><span className="sr-only">Open order</span></th></tr></thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">{order.id}</td>
                      <td><span className={`customer-avatar ${order.color}`}>{order.initials}</span><span className="customer-name">{order.customer}</span></td>
                      <td className="order-date">{order.date}</td>
                      <td><span className={`status-pill ${order.status.toLowerCase()}`}><i />{order.status}</span></td>
                      <td className="order-total">${order.total}.00</td>
                      <td><button className="row-action" type="button" aria-label={`View order ${order.id}`}><Icon name="chevron" size={17} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel inventory-panel" id="inventory">
            <div className="panel-heading inventory-heading">
              <div><h2>Inventory <span className="count-pill">{products.length} products</span></h2><p>A little peek at what&apos;s on your shelves.</p></div>
              <div className="inventory-actions">
                <label className="inventory-search"><Icon name="search" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." aria-label="Search inventory" /></label>
                <button className="button button-dark" onClick={() => setShowProductForm(true)} type="button"><Icon name="plus" size={16} />Add product</button>
              </div>
            </div>
            {inventoryError && (
              <div className="inventory-error" role="alert">
                <span>{inventoryError}</span>
                <button type="button" onClick={() => window.location.reload()}>Retry</button>
              </div>
            )}
            <div className="table-scroll">
              <table className="inventory-table">
                <thead><tr><th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th><span className="sr-only">Product actions</span></th></tr></thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td><span className="product-swatch inventory-swatch" style={{ backgroundColor: product.color }} /><strong>{product.name}</strong></td>
                      <td className="sku-cell">{product.sku}</td>
                      <td>{product.category}</td>
                      <td className="order-total">${product.price.toFixed(2)}</td>
                      <td><span className={`stock-pill${product.stock === 0 ? " out-of-stock" : product.stock < 10 ? " low-stock" : ""}`}><i />{product.stock === 0 ? "Out of stock" : product.stock < 10 ? `Low stock · ${product.stock}` : `${product.stock} in stock`}</span></td>
                      <td><button className="row-action more-action" type="button" aria-label={`More options for ${product.name}`}>···</button></td>
                    </tr>
                  ))}
                  {isLoadingProducts && <tr><td className="empty-row" colSpan={6}>Loading products from MongoDB...</td></tr>}
                  {!isLoadingProducts && filteredProducts.length === 0 && (
                    <tr><td className="empty-row" colSpan={6}>
                      {search ? `No products match “${search}”.` : "No products in your MongoDB inventory yet. Add your first product."}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="page-footer"><span>Made with care <span className="footer-heart">♥</span> for Sunday Studio</span><span>Need help? <a href="mailto:hello@sunday.studio">Get in touch</a></span></footer>
        </div>
      </main>

      {notice && <div className="toast" role="status">{notice}</div>}

      {showProductForm && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowProductForm(false); }}>
          <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading">
              <div><span className="modal-eyebrow">YOUR COLLECTION</span><h2 id="modal-title">Add a product</h2><p>Give your next favorite piece a place in your shop.</p></div>
              <button className="icon-button modal-close" type="button" aria-label="Close dialog" onClick={() => setShowProductForm(false)}><Icon name="close" /></button>
            </div>
            <form onSubmit={addProduct}>
              <label className="form-field">Product name<input name="name" placeholder="e.g. Sunday Linen Shirt" required autoFocus /></label>
              <div className="form-row">
                <label className="form-field">SKU<input name="sku" placeholder="e.g. TOP-006" required /></label>
                <label className="form-field">Category<select name="category" defaultValue="Tops"><option>Tops</option><option>Bottoms</option><option>Knitwear</option><option>Dresses</option><option>Outerwear</option></select></label>
              </div>
              <div className="form-row">
                <label className="form-field">Price (USD)<input name="price" type="number" min="0" step="0.01" placeholder="0.00" required /></label>
                <label className="form-field">Stock quantity<input name="stock" type="number" min="0" step="1" placeholder="0" required /></label>
              </div>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-actions"><button className="button button-outline" type="button" onClick={() => setShowProductForm(false)} disabled={isSavingProduct}>Cancel</button><button className="button button-dark" type="submit" disabled={isSavingProduct}>{isSavingProduct ? "Saving..." : <><Icon name="plus" size={16} />Add product</>}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
