import VendorLayout from "../../layout/VendorLayout";
import { Package, ShoppingCart, DollarSign, TrendingUp, Plus, FileText, Settings, Bell, ArrowUpRight } from "lucide-react";
import "../../styles/Dashboard.css";

export default function Dashboard() {
  return (
    <VendorLayout>
      <div className="gl-v-container">

        <header className="gl-v-header">
          <span className="gl-v-meta">// STATION_ACTIVE: ENCRYPTED_CONNECTION</span>
          <h1 className="gl-v-welcome">STATION DASHBOARD</h1>
          <p className="gl-v-subtitle">Inventory oversight and commercial metrics for the TagTurn ecosystem.</p>
        </header>

        {/* Stats Grid */}
        <div className="gl-v-stats-grid">
          <div className="gl-v-stat-card">
            <div className="gl-v-stat-header">
              <Package size={20} strokeWidth={1.5} />
              <span className="gl-v-trend positive">+12%</span>
            </div>
            <div className="gl-v-stat-value">248</div>
            <div className="gl-v-stat-label">TOTAL_PRODUCTS</div>
          </div>

          <div className="gl-v-stat-card">
            <div className="gl-v-stat-header">
              <ShoppingCart size={20} strokeWidth={1.5} />
              <span className="gl-v-trend positive">+23%</span>
            </div>
            <div className="gl-v-stat-value">1,284</div>
            <div className="gl-v-stat-label">ORDER_VOLUME</div>
          </div>

          <div className="gl-v-stat-card">
            <div className="gl-v-stat-header">
              <DollarSign size={20} strokeWidth={1.5} />
              <span className="gl-v-trend positive">+18%</span>
            </div>
            <div className="gl-v-stat-value">₹45,280</div>
            <div className="gl-v-stat-label">GROSS_REVENUE</div>
          </div>

          <div className="gl-v-stat-card">
            <div className="gl-v-stat-header">
              <TrendingUp size={20} strokeWidth={1.5} />
              <span className="gl-v-trend negative">-5%</span>
            </div>
            <div className="gl-v-stat-value">4.8</div>
            <div className="gl-v-stat-label">AVG_USER_RATING</div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="gl-v-actions">
          <button className="gl-v-action-btn">
            <Plus size={18} /> <span>ADD_NEW_ITEM</span>
          </button>
          <button className="gl-v-action-btn">
            <FileText size={18} /> <span>VIEW_MANIFESTS</span>
          </button>
          <button className="gl-v-action-btn">
            <Settings size={18} /> <span>CONFIGURATION</span>
          </button>
          <button className="gl-v-action-btn">
            <Bell size={18} /> <span>NOTIFICATIONS</span>
          </button>
        </div>

        {/* Recent Activity Table Style */}
        <div className="gl-v-activity-box">
          <div className="gl-v-activity-header">
            <ActivityIcon />
            <h2>RECENT_LOGS</h2>
          </div>
          <div className="gl-v-activity-list">
            <ActivityItem icon={<ShoppingCart size={16}/>} title="New order received - #ORD-2845" time="2m ago" />
            <ActivityItem icon={<Package size={16}/>} title="Product collection updated" time="1h ago" />
            <ActivityItem icon={<DollarSign size={16}/>} title="Payment processed - ₹2,450" time="3h ago" />
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}

// Sub-components for cleaner structure
function ActivityIcon() {
  return <div className="gl-v-activity-indicator" />
}

function ActivityItem({ icon, title, time }) {
  return (
    <div className="gl-v-activity-item">
      <div className="gl-v-item-icon">{icon}</div>
      <div className="gl-v-item-text">
        <span className="gl-v-item-title">{title}</span>
        <span className="gl-v-item-time">{time}</span>
      </div>
      <ArrowUpRight size={14} className="gl-v-item-arrow" />
    </div>
  );
}