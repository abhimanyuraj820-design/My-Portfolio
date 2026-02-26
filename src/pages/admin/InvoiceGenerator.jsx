import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "../../components/admin/Sidebar";
import API_BASE_URL from "../../config";
import {
  Menu, Plus, Trash2, X, Download, Mail, Eye,
  ChevronDown, Loader2, FileText, Search,
  CheckCircle2, Clock, AlertCircle, MoreHorizontal,
  Receipt, User, Calendar, Hash, IndianRupee,
  Send, RefreshCw, Pencil
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const fmtCurrency = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const today = () => new Date().toISOString().slice(0, 10);
const defaultDue = () => {
  const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10);
};
const genInvoiceNumber = () =>
  `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS = {
  Pending:  { icon: Clock,         color: "amber",   bg: "bg-amber-500/15",   text: "text-amber-400",  border: "border-amber-500/30"  },
  Paid:     { icon: CheckCircle2,  color: "emerald", bg: "bg-emerald-500/15", text: "text-emerald-400",border: "border-emerald-500/30" },
  Overdue:  { icon: AlertCircle,   color: "red",     bg: "bg-red-500/15",     text: "text-red-400",    border: "border-red-500/30"    },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS[status] || STATUS.Pending;
  const Ic = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Ic size={10} />
      {status}
    </span>
  );
};

// ── Blank item row ────────────────────────────────────────────────────────────
const blankItem = () => ({ description: "", qty: 1, price: "" });

// ── PDF Generator ─────────────────────────────────────────────────────────────
const generatePDF = (invoice, settings) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const PAGE_W = doc.internal.pageSize.getWidth();
  const accentR = 139, accentG = 92, accentB = 246; // violet-500

  // ─ Header background ─
  doc.setFillColor(18, 20, 31);
  doc.rect(0, 0, PAGE_W, 120, "F");

  // ─ Brand name ─
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(settings?.fullName || "Your Business", 40, 55);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 200);
  doc.text(settings?.contactEmail || "", 40, 72);
  doc.text(settings?.headline || "", 40, 87);

  // ─ INVOICE badge ─
  doc.setFillColor(accentR, accentG, accentB);
  doc.roundedRect(PAGE_W - 130, 38, 90, 28, 5, 5, "F");
  doc.setFontSize(13);
  doc.setFont("courier", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", PAGE_W - 85, 57, { align: "center" });

  // ─ Invoice meta ─
  const metaY = 140;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 150);

  const meta = [
    ["Invoice No.", invoice.invoiceNumber],
    ["Date", fmtDate(invoice.date)],
    ["Due Date", fmtDate(invoice.dueDate)],
    ["Status", invoice.status],
  ];
  meta.forEach(([label, value], i) => {
    const y = metaY + i * 18;
    doc.text(label, PAGE_W - 220, y);
    doc.setFont("courier", "bold");
    doc.setTextColor(220, 220, 240);
    doc.text(value, PAGE_W - 100, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 150);
  });

  // ─ Divider ─
  doc.setDrawColor(accentR, accentG, accentB);
  doc.setLineWidth(0.5);
  doc.line(40, 210, PAGE_W - 40, 210);

  // ─ Bill To ─
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accentR, accentG, accentB);
  doc.text("BILL TO", 40, 230);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(240, 240, 255);
  doc.text(invoice.clientName, 40, 248);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 190);
  doc.text(invoice.clientEmail, 40, 263);

  // ─ Items table ─
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  autoTable(doc, {
    startY: 290,
    margin: { left: 40, right: 40 },
    head: [["#", "Description", "Qty", "Unit Price", "Amount"]],
    body: items.map((it, idx) => [
      idx + 1,
      it.description,
      it.qty,
      `₹${Number(it.price).toLocaleString("en-IN")}`,
      `₹${(it.qty * it.price).toLocaleString("en-IN")}`,
    ]),
    styles: {
      font: "courier",
      fontSize: 9,
      textColor: [210, 210, 230],
      fillColor: [18, 20, 31],
      lineColor: [45, 48, 68],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [accentR, accentG, accentB],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [22, 25, 38] },
    columnStyles: {
      0: { halign: "center", cellWidth: 30 },
      2: { halign: "center", cellWidth: 40 },
      3: { halign: "right",  cellWidth: 80 },
      4: { halign: "right",  cellWidth: 85 },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 20;

  // ─ Total box ─
  doc.setFillColor(accentR, accentG, accentB, 0.15);
  doc.setFillColor(30, 32, 50);
  doc.roundedRect(PAGE_W - 220, finalY, 180, 40, 6, 6, "F");
  doc.setDrawColor(accentR, accentG, accentB);
  doc.setLineWidth(1);
  doc.roundedRect(PAGE_W - 220, finalY, 180, 40, 6, 6, "D");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 190);
  doc.text("TOTAL AMOUNT", PAGE_W - 210, finalY + 14);
  doc.setFontSize(16);
  doc.setFont("courier", "bold");
  doc.setTextColor(accentR, accentG, accentB);
  doc.text(fmtCurrency(invoice.totalAmount), PAGE_W - 50, finalY + 32, { align: "right" });

  // ─ Footer ─
  const footerY = doc.internal.pageSize.getHeight() - 40;
  doc.setFillColor(18, 20, 31);
  doc.rect(0, footerY - 10, PAGE_W, 60, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 110);
  doc.text("Thank you for your business!", PAGE_W / 2, footerY + 8, { align: "center" });
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, PAGE_W / 2, footerY + 20, { align: "center" });

  doc.save(`${invoice.invoiceNumber}.pdf`);
};

// ── Item Row ──────────────────────────────────────────────────────────────────
const ItemRow = ({ item, index, onChange, onRemove, canRemove }) => {
  const subtotal = (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0);
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-5">
        <input
          value={item.description}
          onChange={(e) => onChange(index, "description", e.target.value)}
          placeholder="Service / Item description"
          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white text-sm placeholder-white/25 transition-colors"
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          value={item.qty}
          min={1}
          onChange={(e) => onChange(index, "qty", e.target.value)}
          placeholder="Qty"
          className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white font-mono text-sm placeholder-white/25 text-center transition-colors"
        />
      </div>
      <div className="col-span-2">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 font-mono text-xs">₹</span>
          <input
            type="number"
            value={item.price}
            min={0}
            onChange={(e) => onChange(index, "price", e.target.value)}
            placeholder="0"
            className="w-full pl-6 pr-2 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none text-white font-mono text-sm placeholder-white/25 transition-colors"
          />
        </div>
      </div>
      <div className="col-span-2 text-right">
        <span className="font-mono text-sm text-white/70">
          {subtotal > 0 ? `₹${subtotal.toLocaleString("en-IN")}` : "—"}
        </span>
      </div>
      <div className="col-span-1 flex justify-center">
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

// ── Create / Edit Invoice Form (full-page overlay) ───────────────────────────
const InvoiceForm = ({ invoice: editing, onClose, onSaved, settings }) => {
  const isEdit = !!editing?.id;
  const [form, setForm] = useState(
    editing
      ? {
          invoiceNumber: editing.invoiceNumber,
          clientName: editing.clientName,
          clientEmail: editing.clientEmail,
          status: editing.status,
          date: editing.date?.slice(0, 10) || today(),
          dueDate: editing.dueDate?.slice(0, 10) || defaultDue(),
          items: Array.isArray(editing.items) ? editing.items.map(it => ({
            description: it.description || "",
            qty: it.qty || 1,
            price: it.price || "",
          })) : [blankItem()],
        }
      : {
          invoiceNumber: genInvoiceNumber(),
          clientName: "",
          clientEmail: "",
          status: "Pending",
          date: today(),
          dueDate: defaultDue(),
          items: [blankItem()],
        }
  );
  const [saving, setSaving] = useState(false);

  const total = form.items.reduce(
    (s, it) => s + (parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0), 0
  );

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setItem = (i, key, val) =>
    setForm((f) => {
      const arr = [...f.items];
      arr[i] = { ...arr[i], [key]: val };
      return { ...f, items: arr };
    });

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, blankItem()] }));
  const removeItem = (i) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.clientEmail.trim()) {
      toast.error("Client name and email are required");
      return;
    }
    if (form.items.some(it => !it.description.trim())) {
      toast.error("All items must have a description");
      return;
    }
    setSaving(true);
    const payload = { ...form, totalAmount: total };
    try {
      const url = isEdit
        ? `${API_BASE_URL}/api/invoices/${editing.id}`
        : `${API_BASE_URL}/api/invoices`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        toast.success(isEdit ? "Invoice updated!" : "Invoice created!");
        onSaved(saved);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
      }
    } catch { toast.error("Network error"); }
    setSaving(false);
  };

  const handleSaveAndDownload = async () => {
    await handleSave();
    generatePDF({ ...form, totalAmount: total }, settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm">
      <div className="ml-auto w-full max-w-2xl bg-[#0d0f1a] border-l border-white/10 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d0f1a] shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">{isEdit ? "Edit Invoice" : "New Invoice"}</h2>
            <p className="text-white/40 text-xs font-mono mt-0.5">{form.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Meta row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-xs">Invoice No.</label>
              <input
                value={form.invoiceNumber}
                onChange={(e) => setField("invoiceNumber", e.target.value)}
                className="form-input font-mono"
              />
            </div>
            <div>
              <label className="label-xs">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                className="form-input font-mono"
              />
            </div>
            <div>
              <label className="label-xs">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setField("dueDate", e.target.value)}
                className="form-input font-mono"
              />
            </div>
          </div>

          {/* Client */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8 space-y-3">
            <p className="text-violet-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <User size={12} /> Client Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-xs">Client Name *</label>
                <input
                  value={form.clientName}
                  onChange={(e) => setField("clientName", e.target.value)}
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>
              <div>
                <label className="label-xs">Client Email *</label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setField("clientEmail", e.target.value)}
                  placeholder="john@example.com"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="label-xs">Status</label>
            <div className="flex gap-2">
              {["Pending", "Paid", "Overdue"].map((s) => {
                const cfg = STATUS[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setField("status", s)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                      form.status === s
                        ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                        : "bg-transparent border-white/10 text-white/40 hover:border-white/20"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-violet-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Receipt size={12} /> Line Items
              </p>
            </div>
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 mb-2 px-0">
              {["Description", "Qty", "Unit Price", "Amount", ""].map((h, i) => (
                <div key={i} className={`text-white/30 text-[10px] font-semibold uppercase tracking-wider ${
                  i === 0 ? "col-span-5" : i === 1 ? "col-span-2 text-center" : i === 2 ? "col-span-2" : i === 3 ? "col-span-2 text-right" : "col-span-1"
                }`}>{h}</div>
              ))}
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <ItemRow
                  key={i}
                  item={item}
                  index={i}
                  onChange={setItem}
                  onRemove={removeItem}
                  canRemove={form.items.length > 1}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-3 flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-64 rounded-xl bg-violet-500/10 border border-violet-500/25 px-5 py-4">
              <div className="flex justify-between text-sm text-white/50 mb-1">
                <span>Subtotal</span>
                <span className="font-mono">{fmtCurrency(total)}</span>
              </div>
              <div className="border-t border-violet-500/20 pt-2 mt-2 flex justify-between">
                <span className="text-white font-semibold text-sm">Total</span>
                <span className="font-mono font-bold text-violet-300 text-lg">{fmtCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 border-t border-white/10 px-6 py-4 flex gap-3 bg-[#0d0f1a]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#252836] hover:bg-[#2d3044] border border-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Save Invoice
          </button>
          <button
            onClick={handleSaveAndDownload}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-lg shadow-violet-500/20"
          >
            <Download size={14} /> Save & Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Invoice Row ───────────────────────────────────────────────────────────────
const InvoiceRow = ({ invoice, onEdit, onDelete, onDownload, onEmail, onStatusChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices/${invoice.id}`, {
        method: "DELETE", headers: getHeaders(),
      });
      if (res.ok) { toast.success("Invoice deleted"); onDelete(); }
      else toast.error("Delete failed");
    } catch { toast.error("Network error"); }
    setDeleting(false);
    setMenuOpen(false);
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
      <td className="px-5 py-4">
        <span className="font-mono text-xs text-violet-400 font-bold">{invoice.invoiceNumber}</span>
      </td>
      <td className="px-5 py-4">
        <p className="text-white text-sm font-medium">{invoice.clientName}</p>
        <p className="text-white/40 text-xs">{invoice.clientEmail}</p>
      </td>
      <td className="px-5 py-4 text-white/50 text-xs font-mono">{fmtDate(invoice.date)}</td>
      <td className="px-5 py-4 text-white/50 text-xs font-mono">{fmtDate(invoice.dueDate)}</td>
      <td className="px-5 py-4">
        <span className="font-mono font-bold text-white text-sm">{fmtCurrency(invoice.totalAmount)}</span>
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={invoice.status} />
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            title="Edit"
            onClick={() => onEdit(invoice)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <Pencil size={13} />
          </button>
          <button
            title="Download PDF"
            onClick={() => onDownload(invoice)}
            className="p-1.5 rounded-lg text-white/40 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
          >
            <Download size={13} />
          </button>
          <button
            title="Send to client (mock)"
            onClick={() => onEmail(invoice)}
            className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
          >
            <Send size={13} />
          </button>
          {/* Status quick-toggle */}
          <div className="relative">
            <button
              title="Change status"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <MoreHorizontal size={13} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-[#1a1d2e] border border-white/10 rounded-xl p-1 z-20 min-w-[140px] shadow-xl">
                {["Pending", "Paid", "Overdue"].map((s) => {
                  const cfg = STATUS[s];
                  const Ic = cfg.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => { onStatusChange(invoice.id, s); setMenuOpen(false); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-xs rounded-lg transition-all ${cfg.text} hover:${cfg.bg}`}
                    >
                      <Ic size={11} /> Mark as {s}
                    </button>
                  );
                })}
                <div className="border-t border-white/10 mt-1 pt-1">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const InvoiceGenerator = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [settings, setSettings] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices`, { headers: getHeaders() });
      if (res.ok) setInvoices(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      if (res.ok) setSettings(await res.json());
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchInvoices(); fetchSettings(); }, [fetchInvoices, fetchSettings]);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices/${id}`, {
        method: "PUT", headers: getHeaders(), body: JSON.stringify({ status }),
      });
      if (res.ok) { toast.success(`Marked as ${status}`); fetchInvoices(); }
      else toast.error("Failed to update status");
    } catch { toast.error("Network error"); }
  };

  const handleEmail = (inv) => {
    const subject = encodeURIComponent(`Invoice ${inv.invoiceNumber} from ${settings?.fullName || "Your Name"}`);
    const body = encodeURIComponent(
      `Hi ${inv.clientName},\n\nPlease find attached your invoice ${inv.invoiceNumber} for ₹${Number(inv.totalAmount).toLocaleString("en-IN")}.\n\nDue Date: ${fmtDate(inv.dueDate)}\n\nThank you for your business!\n\n${settings?.fullName || ""}`
    );
    window.open(`mailto:${inv.clientEmail}?subject=${subject}&body=${body}`, "_blank");
    toast.info(`Opened email draft for ${inv.clientEmail}`);
  };

  const handleDownload = (inv) => generatePDF(inv, settings);

  const handleSaved = () => { setFormOpen(false); setEditingInvoice(null); fetchInvoices(); };

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      !search ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.totalAmount, 0);
  const pendingAmount = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + i.totalAmount, 0);
  const overdueCount = invoices.filter(i => i.status === "Overdue").length;

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-64 min-h-screen">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#161822] border-b border-[#252836] sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-white/60 hover:text-white rounded-lg">
            <Menu size={20} />
          </button>
          <h1 className="text-white font-bold flex-1">Invoices</h1>
          <button
            onClick={() => { setEditingInvoice(null); setFormOpen(true); }}
            className="p-2 bg-violet-600 text-white rounded-lg"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="p-4 md:p-6 xl:p-8">
          {/* Desktop Header */}
          <div className="hidden md:flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Invoice Generator</h1>
              <p className="text-white/40 text-sm mt-1">Create, manage and send professional invoices</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchInvoices}
                className="p-2.5 rounded-xl bg-[#252836] border border-white/10 text-white/40 hover:text-white transition-all"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => { setEditingInvoice(null); setFormOpen(true); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
              >
                <Plus size={16} /> New Invoice
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Invoices",   value: invoices.length,            icon: FileText,     color: "violet", mono: false },
              { label: "Revenue Earned",   value: fmtCurrency(totalRevenue),  icon: IndianRupee,  color: "emerald",mono: true  },
              { label: "Pending Amount",   value: fmtCurrency(pendingAmount), icon: Clock,        color: "amber",  mono: true  },
              { label: "Overdue",          value: overdueCount,               icon: AlertCircle,  color: "red",    mono: false },
            ].map(({ label, value, icon: Ic, color, mono }) => (
              <div key={label} className={`flex items-center gap-3 px-4 py-4 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                <Ic size={18} className={`text-${color}-400 shrink-0`} />
                <div>
                  <p className="text-white/40 text-xs leading-tight">{label}</p>
                  <p className={`text-white font-bold text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client name, email or invoice number…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#161822] border border-white/10 focus:border-violet-500/40 focus:outline-none text-white text-sm placeholder-white/25 transition-colors"
              />
            </div>
            <div className="flex gap-1.5">
              {["All", "Pending", "Paid", "Overdue"].map((s) => {
                const cfg = s !== "All" ? STATUS[s] : null;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      statusFilter === s
                        ? cfg
                          ? `${cfg.bg} ${cfg.text} ${cfg.border} border`
                          : "bg-violet-600 text-white"
                        : "bg-[#161822] border border-white/10 text-white/40 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f1a] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={28} className="animate-spin text-violet-400" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Receipt size={28} className="text-violet-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">
                  {invoices.length === 0 ? "No Invoices Yet" : "No Results Found"}
                </h3>
                <p className="text-white/40 text-sm mb-6 max-w-xs">
                  {invoices.length === 0
                    ? "Create your first invoice to start tracking payments."
                    : "Try adjusting your filters or search term."}
                </p>
                {invoices.length === 0 && (
                  <button
                    onClick={() => { setEditingInvoice(null); setFormOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all"
                  >
                    <Plus size={15} /> Create Invoice
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/[0.02]">
                      {["Invoice #", "Client", "Date", "Due Date", "Amount", "Status", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv) => (
                      <InvoiceRow
                        key={inv.id}
                        invoice={inv}
                        onEdit={(i) => { setEditingInvoice(i); setFormOpen(true); }}
                        onDelete={fetchInvoices}
                        onDownload={handleDownload}
                        onEmail={handleEmail}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Form Overlay */}
      {formOpen && (
        <InvoiceForm
          invoice={editingInvoice}
          onClose={() => { setFormOpen(false); setEditingInvoice(null); }}
          onSaved={handleSaved}
          settings={settings}
        />
      )}
    </div>
  );
};

export default InvoiceGenerator;
