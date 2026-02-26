import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/admin/Sidebar";
import { m as motion, AnimatePresence } from "framer-motion";
import API_BASE_URL from "../../config";
import {
  Menu, Plus, Pencil, Trash2, X, Check, Package,
  Clock, DollarSign, Star, Zap, Shield, Layers,
  Code, Globe, Smartphone, Palette, Database, Bot,
  ChevronDown, AlertTriangle, Loader2
} from "lucide-react";

// ── Icon map ────────────────────────────────────────────────────────────────
const ICON_OPTIONS = [
  { value: "Code", label: "Code", Icon: Code },
  { value: "Globe", label: "Web", Icon: Globe },
  { value: "Smartphone", label: "Mobile", Icon: Smartphone },
  { value: "Palette", label: "Design", Icon: Palette },
  { value: "Database", label: "Database", Icon: Database },
  { value: "Bot", label: "AI/Bot", Icon: Bot },
  { value: "Layers", label: "Full-Stack", Icon: Layers },
  { value: "Shield", label: "Security", Icon: Shield },
  { value: "Zap", label: "Performance", Icon: Zap },
];

const ICON_COMPONENT_MAP = { Code, Globe, Smartphone, Palette, Database, Bot, Layers, Shield, Zap };

const ServiceIcon = ({ name, size = 24, className = "" }) => {
  const Comp = ICON_COMPONENT_MAP[name] || Package;
  return <Comp size={size} className={className} />;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  deliveryTime: "",
  icon: "Code",
  features: [""],
};

// ── Service Card ─────────────────────────────────────────────────────────────
const ServiceCard = ({ service, onEdit, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${service.title}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/services/${service.id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) { toast.success("Service deleted"); onDelete(); }
      else toast.error("Failed to delete");
    } catch { toast.error("Network error"); }
    setDeleting(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="relative group flex flex-col rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 hover:border-violet-500/30 hover:bg-white/[0.05] transition-all duration-500 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
    >
      {/* Premium Backdrop Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2rem]" />

      {/* Icon + Actions */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-white transition-all duration-500 shadow-lg">
          <ServiceIcon name={service.icon} size={24} />
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={() => onEdit(service)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-10 h-10 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400/50 hover:text-white hover:bg-red-500 flex items-center justify-center transition-all"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {/* Title + Description */}
      <div className="space-y-3 mb-8 relative z-10">
        <h3 className="text-white font-black text-2xl tracking-tight leading-none group-hover:text-violet-400 transition-colors duration-300">{service.title}</h3>
        <p className="text-white/40 text-sm leading-relaxed line-clamp-3 font-medium">{service.description}</p>
      </div>

      {/* Features */}
      {service.features?.length > 0 && (
        <div className="space-y-4 mb-8 relative z-10">
          <div className="h-px bg-gradient-to-r from-white/10 to-transparent" />
          <ul className="grid grid-cols-1 gap-3">
            {service.features.filter(Boolean).slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-xs font-bold text-white/60 group-hover:text-white/80 transition-colors uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                <span className="truncate">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="pt-6 border-t border-white/5 flex items-end justify-between mt-auto relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Investment</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-black text-white tracking-tighter">
              ₹{Number(service.price).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <Clock size={12} className="text-violet-400" />
          <span>{service.deliveryTime}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ── Feature Row ───────────────────────────────────────────────────────────────
const FeatureRow = ({ value, index, onChange, onRemove, onAdd, isLast }) => (
  <div className="flex items-center gap-2">
    <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
      <Check size={10} className="text-violet-400" />
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(index, e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && isLast && onAdd()}
      placeholder={`Feature ${index + 1}`}
      className="flex-1 bg-transparent text-white text-sm placeholder-white/25 border-b border-white/10 focus:border-violet-500/50 focus:outline-none py-1 transition-colors"
    />
    {index > 0 && (
      <button onClick={() => onRemove(index)} className="text-white/25 hover:text-red-400 transition-colors">
        <X size={14} />
      </button>
    )}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
const ServiceModal = ({ service, onClose, onSaved }) => {
  const isEdit = !!service?.id;
  const [form, setForm] = useState(
    service ? {
      title: service.title,
      description: service.description,
      price: service.price,
      deliveryTime: service.deliveryTime,
      icon: service.icon || "Code",
      status: service.status || "Active",
      priorityOrder: service.priorityOrder ?? 0,
      features: service.features?.length ? [...service.features] : [""],
    } : { ...EMPTY_FORM, status: "Active", priorityOrder: 0 }
  );
  const [saving, setSaving] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setFeature = (i, v) =>
    setForm((f) => { const arr = [...f.features]; arr[i] = v; return { ...f, features: arr }; });
  const addFeature = () =>
    setForm((f) => ({ ...f, features: [...f.features, ""] }));
  const removeFeature = (i) =>
    setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.price || !form.deliveryTime.trim()) {
      toast.error("Title, Price and Delivery Time are required");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      features: form.features.filter(Boolean),
    };
    try {
      const url = isEdit
        ? `${API_BASE_URL}/api/services/${service.id}`
        : `${API_BASE_URL}/api/services`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(isEdit ? "Service updated!" : "Service created!");
        onSaved();
      } else {
        const err = await res.json();
        toast.error(err.error || "Save failed");
      }
    } catch { toast.error("Network error"); }
    setSaving(false);
  };

  const selectedIconMeta = ICON_OPTIONS.find((o) => o.value === form.icon) || ICON_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="relative bg-[#12141f] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        data-lenis-prevent
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4 bg-[#12141f] border-b border-white/8">
          <div>
            <h2 className="text-white font-bold text-xl">{isEdit ? "Edit Service" : "New Service"}</h2>
            <p className="text-white/40 text-xs mt-0.5">{isEdit ? "Update your service package" : "Add a new service to your portfolio"}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Icon Picker */}
          <div>
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">Icon</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIconOpen(!iconOpen)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/40 text-white transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400">
                  <selectedIconMeta.Icon size={16} />
                </div>
                <span className="flex-1 text-sm">{selectedIconMeta.label}</span>
                <ChevronDown size={14} className={`text-white/40 transition-transform ${iconOpen ? "rotate-180" : ""}`} />
              </button>
              {iconOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-[#1a1d2e] border border-white/10 rounded-xl p-2 z-20 grid grid-cols-3 gap-1.5">
                  {ICON_OPTIONS.map(({ value, label, Icon: Ic }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setField("icon", value); setIconOpen(false); }}
                      className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg text-xs transition-all ${form.icon === value
                        ? "bg-violet-500/20 border border-violet-500/40 text-violet-300"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <Ic size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">Service Title *</label>
            <input
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Full-Stack Web Development"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white text-sm placeholder-white/25 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Brief description of what this package includes..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white text-sm placeholder-white/25 transition-colors resize-none"
            />
          </div>

          {/* Price + Delivery */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-mono text-sm">₹</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="15000"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white font-mono text-sm placeholder-white/25 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">Delivery Time *</label>
              <input
                value={form.deliveryTime}
                onChange={(e) => setField("deliveryTime", e.target.value)}
                placeholder="7-10 days"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white text-sm placeholder-white/25 transition-colors"
              />
            </div>
          </div>

          {/* Status + Priority Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white text-sm transition-colors"
              >
                <option value="Active" className="bg-[#1a1d2e]">✅ Active (show on website)</option>
                <option value="Inactive" className="bg-[#1a1d2e]">🔴 Inactive (hidden)</option>
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2 block">Order (Priority)</label>
              <input
                type="number"
                value={form.priorityOrder}
                onChange={(e) => setField("priorityOrder", e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white font-mono text-sm placeholder-white/25 transition-colors"
              />
              <p className="text-white/30 text-[10px] mt-1">Lower = shown first on website</p>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Feature Points</label>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Plus size={12} /> Add Feature
              </button>
            </div>
            <div className="space-y-3 bg-white/[0.03] rounded-xl p-4 border border-white/5">
              {form.features.map((feat, i) => (
                <FeatureRow
                  key={i}
                  value={feat}
                  index={i}
                  onChange={setFeature}
                  onRemove={removeFeature}
                  onAdd={addFeature}
                  isLast={i === form.features.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#12141f] border-t border-white/8 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {saving ? "Saving…" : isEdit ? "Update Service" : "Create Service"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ServicesManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { service?: obj }

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/services`, { headers: getHeaders() });
      if (res.ok) setServices(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSaved = () => { setModal(null); fetchServices(); };

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-64 min-h-screen">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#161822] border-b border-[#252836] sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-white/60 hover:text-white rounded-lg">
            <Menu size={20} />
          </button>
          <h1 className="text-white font-bold flex-1">Services</h1>
        </div>

        <div className="p-4 md:p-6 xl:p-8">
          {/* Desktop Header */}
          <div className="hidden md:flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Services Manager</h1>
              <p className="text-white/40 text-sm mt-1">Manage your freelance service packages & pricing</p>
            </div>
            <button
              onClick={() => setModal({ service: null })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
            >
              <Plus size={16} /> Add Service
            </button>
          </div>

          {/* Mobile Add Button */}
          <div className="md:hidden flex justify-end mb-4">
            <button
              onClick={() => setModal({ service: null })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold"
            >
              <Plus size={15} /> Add Service
            </button>
          </div>

          {/* Stats row */}
          {!loading && services.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {[
                { label: "Total Services", value: services.length, icon: Package, color: "violet" },
                {
                  label: "Avg. Price",
                  value: `₹${Math.round(services.reduce((s, sv) => s + sv.price, 0) / services.length).toLocaleString("en-IN")}`,
                  icon: DollarSign,
                  color: "emerald",
                  mono: true,
                },
                {
                  label: "Total Features",
                  value: services.reduce((s, sv) => s + (sv.features?.filter(Boolean).length || 0), 0),
                  icon: Star,
                  color: "amber",
                },
              ].map(({ label, value, icon: Ic, color, mono }) => (
                <div key={label} className={`flex items-center gap-4 px-5 py-4 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                  <Ic size={20} className={`text-${color}-400 shrink-0`} />
                  <div>
                    <p className="text-white/40 text-xs">{label}</p>
                    <p className={`text-white font-bold ${mono ? "font-mono" : ""}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-violet-400" />
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                <Package size={28} className="text-violet-400" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">No Services Yet</h3>
              <p className="text-white/40 text-sm mb-6 max-w-xs">Add your first service package to showcase what you offer to clients.</p>
              <button
                onClick={() => setModal({ service: null })}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all"
              >
                <Plus size={15} /> Create Your First Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {services.map((svc) => (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    onEdit={(s) => setModal({ service: s })}
                    onDelete={fetchServices}
                  />
                ))}
              </AnimatePresence>
              {/* Add New Card */}
              <motion.button
                layout
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModal({ service: null })}
                className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-violet-500/20 hover:bg-violet-500/5 text-white/20 hover:text-violet-400 transition-all min-h-[300px] group shadow-inner"
              >
                <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                  <Plus size={32} />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-black uppercase tracking-widest">Expansion Required</span>
                  <span className="text-[10px] text-white/20 uppercase tracking-tighter">Add New Service tier</span>
                </div>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <ServiceModal
          service={modal.service}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default ServicesManager;
