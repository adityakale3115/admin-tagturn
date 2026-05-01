import React, { useState } from "react";
import VendorLayout from "../../layout/VendorLayout";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  FileText, 
  Settings, 
  ArrowUpRight, 
  Moon, 
  Sun 
} from "lucide-react";
import "../../styles/Dashboard.css";

const STATS = [
  { icon: Package,      value: "248",    label: "Total Products", trend: "+12%", isPos: true  },
  { icon: ShoppingCart, value: "1,284",  label: "Order Volume",   trend: "+23%", isPos: true  },
  { icon: DollarSign,   value: "₹45,280",label: "Gross Revenue",  trend: "+18%", isPos: true  },
  { icon: TrendingUp,   value: "4.8",    label: "Avg. Rating",    trend: "-5%",  isPos: false },
];

export default function Dashboard() {
  const [theme, setTheme] = useState('light');

  return (
      <div className={`pl-page theme-${theme}`}>
        <div className="dashboard-container">
          
          <header className="dashboard-header">
            <div className="header-info">
              <h1 className="header-title">{"Vendor Station"}</h1>
              <p className="header-subtitle">{"System metrics & commercial logs."}</p>
            </div>
            
          </header>

          <section className="stats-grid">
            {STATS.map((stat, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-header">
                  <div className="stat-icon-wrapper"><stat.icon size={20} /></div>
                  <span className={`trend-badge ${stat.isPos ? "pos" : "neg"}`}>{stat.trend}</span>
                </div>
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </section>

          <div className="dashboard-main-content">
            <section className="activity-section">
              <div className="section-header"><h2>{"Live Logs"}</h2></div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon"><ShoppingCart size={16}/></div>
                  <div className="activity-info">
                    <span className="activity-title">{"Order #8829 Processed"}</span>
                    <span className="activity-time">{"Just now"}</span>
                  </div>
                  <ArrowUpRight size={14} className="activity-arrow" />
                </div>
              </div>
            </section>

            <section className="actions-section">
              <h2>{"Quick Actions"}</h2>
              <div className="actions-grid">
                <button className="action-btn">
                  <Settings size={20}/>
                  <span>{"Settings"}</span>
                </button>
                <button className="action-btn">
                  <FileText size={20}/>
                  <span>{"Reports"}</span>
                </button>
              </div>
            </section>
          </div>
        </div>
        
    <VendorLayout></VendorLayout>
      </div>
  );
}