import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import Sidebar from "../../components/admin/Sidebar";
import API_BASE_URL from "../../config";
import { generateInvoicePDF } from "./invoicePdfGenerator";
import {
  Menu, Plus, Trash2, X, Download, Eye,
  Loader2, FileText, Search, CheckCircle2, Clock, AlertCircle,
  MoreHorizontal, Receipt, User, IndianRupee, Send, RefreshCw,
  Pencil, Building2, Phone, Mail, MapPin, Globe2, FileCheck,
  Percent, StickyNote, Scale, Hash, Copy, Shuffle, ChevronDown
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});
const fmtCurrency = (n, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(Number(n || 0));
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const today = () => new Date().toISOString().slice(0, 10);
const defaultDue = () => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10); };
const genInvoiceNumber = () => `INV-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`;

const STATUS = {
  Pending: { icon: Clock, bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  Paid: { icon: CheckCircle2, bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  Overdue: { icon: AlertCircle, bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
};
const StatusBadge = ({ status }) => { const c = STATUS[status] || STATUS.Pending; const I = c.icon; return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}><I size={10} />{status}</span>; };

const PAYMENT_METHODS = ["Bank Transfer", "UPI", "Cash", "Cheque", "Credit Card", "PayPal", "Crypto", "Other"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED"];

const blankItem = () => ({ serviceName: "", description: "", qty: 1, price: "" });

const DEFAULT_COMPANY = {
  name: "Abhimanyu Raj",
  email: "novanexusltd001@gmail.com",
  phone: "",
  address: "",
  tagline: "Full Stack Web Developer & Android Developer",
  website: "",
  gstNo: "",
  bankDetails: "",
  upiId: "",
  logoBase64: "",
};

const DEFAULT_TERMS = `1. Payment Terms: Full payment is due within the specified due date.
2. Late Fees: A late fee of 1.5% per month will be applied to overdue balances.
3. Revisions: Includes up to 2 rounds of minor revisions. Additional work will be billed at standard hourly rates.
4. Ownership: Intellectual property rights transfer to the client only upon full and final payment.
5. Confidentiality: All project details and client information will be kept strictly confidential.
6. Liability: The developer's liability is limited to the total amount paid under this invoice.`;

// ── Item Row ──────────────────────────────────────────────────────────────────
const ItemRow = ({ item, index, onChange, onRemove, canRemove, currency }) => {
  const sub = (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0);
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/8 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/30 uppercase">Item #{index + 1}</span>
        {canRemove && <button type="button" onClick={() => onRemove(index)} className="p-1 rounded text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={12} /></button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input value={item.serviceName} onChange={e => onChange(index, "serviceName", e.target.value)} placeholder="Service Name" className="form-input text-sm" />
        <input value={item.description} onChange={e => onChange(index, "description", e.target.value)} placeholder="Description (optional)" className="form-input text-sm" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[9px] text-white/30 font-bold uppercase">Qty</label>
          <input type="number" value={item.qty} min={1} onChange={e => onChange(index, "qty", e.target.value)} className="form-input font-mono text-sm text-center" />
        </div>
        <div>
          <label className="text-[9px] text-white/30 font-bold uppercase">Rate</label>
          <input type="number" value={item.price} min={0} onChange={e => onChange(index, "price", e.target.value)} placeholder="0" className="form-input font-mono text-sm" />
        </div>
        <div>
          <label className="text-[9px] text-white/30 font-bold uppercase">Amount</label>
          <div className="form-input font-mono text-sm text-violet-300 bg-violet-500/5 border-violet-500/20 cursor-default">{sub > 0 ? fmtCurrency(sub, currency) : "—"}</div>
        </div>
      </div>
    </div>
  );
};

// ── Collapsible Section ───────────────────────────────────────────────────────
const Section = ({ title, icon: SectionIcon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors text-left">
        {SectionIcon && <SectionIcon size={14} className="text-violet-400" />}
        <span className="text-xs font-bold uppercase tracking-wider text-violet-300 flex-1">{title}</span>
        <ChevronDown size={14} className={`text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 py-4 space-y-3">{children}</div>}
    </div>
  );
};

// ── Invoice Form (full-page overlay) ──────────────────────────────────────────
const InvoiceForm = ({ invoice: editing, onClose, onSaved, settings }) => {
  const isEdit = !!editing?.id;

  const [company, setCompany] = useState(() => {
    const stored = localStorage.getItem("invoiceCompany");
    if (stored) return JSON.parse(stored);
    return {
      name: settings?.fullName || DEFAULT_COMPANY.name,
      email: settings?.contactEmail || DEFAULT_COMPANY.email,
      phone: settings?.whatsappNumber || DEFAULT_COMPANY.phone,
      address: DEFAULT_COMPANY.address,
      tagline: settings?.headline || DEFAULT_COMPANY.tagline,
      website: DEFAULT_COMPANY.website,
      gstNo: DEFAULT_COMPANY.gstNo,
    };
  });

  const [form, setForm] = useState(() => {
    const meta = editing?.metadata || {};
    return editing
      ? {
        invoiceNumber: editing.invoiceNumber,
        clientName: editing.clientName,
        clientEmail: editing.clientEmail,
        clientPhone: meta.clientPhone || "",
        clientAddress: meta.clientAddress || "",
        status: editing.status,
        date: editing.date?.slice(0, 10) || today(),
        dueDate: editing.dueDate?.slice(0, 10) || defaultDue(),
        paymentMethod: meta.paymentMethod || "",
        currency: meta.currency || "INR",
        gstPercent: meta.gstPercent || 0,
        discountPercent: meta.discountPercent || 0,
        notes: meta.notes || "",
        terms: meta.terms || DEFAULT_TERMS,
        items: Array.isArray(editing.items)
          ? editing.items.map(it => ({
            serviceName: it.serviceName || it.description || "",
            description: it.description && it.serviceName ? it.description : "",
            qty: it.qty || 1,
            price: it.price || "",
          }))
          : [blankItem()],
      }
      : {
        invoiceNumber: genInvoiceNumber(),
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientAddress: "",
        status: "Pending",
        date: today(),
        dueDate: defaultDue(),
        paymentMethod: "",
        currency: "INR",
        gstPercent: 18,
        discountPercent: 0,
        notes: "",
        terms: DEFAULT_TERMS,
        items: [blankItem()],
      };
  });
  const [saving, setSaving] = useState(false);

  // Save company to localStorage on change
  useEffect(() => { localStorage.setItem("invoiceCompany", JSON.stringify(company)); }, [company]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setComp = (k, v) => setCompany(c => ({ ...c, [k]: v }));
  const setItem = (i, key, val) => setForm(f => { const a = [...f.items]; a[i] = { ...a[i], [key]: val }; return { ...f, items: a }; });
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, blankItem()] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setComp("logoBase64", reader.result);
      reader.readAsDataURL(file);
    }
  };

  const subtotal = form.items.reduce((s, it) => s + (parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0), 0);
  const discountAmount = subtotal * (parseFloat(form.discountPercent) || 0) / 100;
  const afterDiscount = subtotal - discountAmount;
  const gstAmount = afterDiscount * (parseFloat(form.gstPercent) || 0) / 100;
  const grandTotal = afterDiscount + gstAmount;

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.clientEmail.trim()) { toast.error("Client name and email are required"); return; }
    if (form.items.some(it => !it.serviceName.trim())) { toast.error("All items need a service name"); return; }
    setSaving(true);

    const metadata = {
      clientPhone: form.clientPhone,
      clientAddress: form.clientAddress,
      paymentMethod: form.paymentMethod,
      currency: form.currency,
      gstPercent: form.gstPercent,
      discountPercent: form.discountPercent,
      notes: form.notes,
      terms: form.terms,
    };

    const payload = {
      invoiceNumber: form.invoiceNumber,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      status: form.status,
      date: form.date,
      dueDate: form.dueDate,
      totalAmount: grandTotal,
      items: form.items,
      metadata
    };

    try {
      const url = isEdit ? `${API_BASE_URL}/api/invoices/${editing.id}` : `${API_BASE_URL}/api/invoices`;
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: getHeaders(), body: JSON.stringify(payload) });
      if (res.ok) { toast.success(isEdit ? "Invoice updated!" : "Invoice created!"); onSaved(); }
      else { const e = await res.json(); toast.error(e.error || "Save failed"); }
    } catch { toast.error("Network error"); }
    setSaving(false);
  };

  const handlePDF = () => {
    generateInvoicePDF(
      { ...form, subtotal, discountAmount, discountPercent: form.discountPercent, gstAmount, gstPercent: form.gstPercent, totalAmount: grandTotal },
      company,
      'preview'
    );
  };

  const handleSaveAndDownload = async () => {
    await handleSave();
    generateInvoicePDF(
      { ...form, subtotal, discountAmount, discountPercent: form.discountPercent, gstAmount, gstPercent: form.gstPercent, totalAmount: grandTotal },
      company,
      'download'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm">
      <div className="ml-auto w-full max-w-2xl bg-[#0d0f1a] border-l border-white/10 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-[#0d0f1a] shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">{isEdit ? "Edit Invoice" : "New Invoice"}</h2>
            <p className="text-white/40 text-xs font-mono mt-0.5">{form.invoiceNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setField("invoiceNumber", genInvoiceNumber())} title="Regenerate Number" className="p-2 text-white/30 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"><Shuffle size={14} /></button>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"><X size={18} /></button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 custom-scrollbar" data-lenis-prevent>

          {/* Company / Sender Details */}
          <Section title="Your Company Details" icon={Building2} defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="label-xs">Company / Your Name</label><input value={company.name} onChange={e => setComp("name", e.target.value)} className="form-input" /></div>
              <div><label className="label-xs">Tagline / Title</label><input value={company.tagline} onChange={e => setComp("tagline", e.target.value)} className="form-input" /></div>
              <div><label className="label-xs">Email</label><input value={company.email} onChange={e => setComp("email", e.target.value)} className="form-input" /></div>
              <div><label className="label-xs">Phone</label><input value={company.phone} onChange={e => setComp("phone", e.target.value)} className="form-input" /></div>
              <div><label className="label-xs">Website</label><input value={company.website} onChange={e => setComp("website", e.target.value)} placeholder="https://..." className="form-input" /></div>
              <div><label className="label-xs">GSTIN</label><input value={company.gstNo} onChange={e => setComp("gstNo", e.target.value)} placeholder="22AAAAA0000A1Z5" className="form-input font-mono" /></div>
            </div>
            <div><label className="label-xs">Address</label><textarea value={company.address} onChange={e => setComp("address", e.target.value)} rows={2} className="form-input resize-none" placeholder="Office/Street, City, State, PIN" /></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="label-xs">Bank Details</label>
                <textarea value={company.bankDetails} onChange={e => setComp("bankDetails", e.target.value)} rows={3} className="form-input resize-none" placeholder="Bank Name:&#10;A/C No:&#10;IFSC:" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="label-xs">UPI ID</label>
                  <input value={company.upiId} onChange={e => setComp("upiId", e.target.value)} placeholder="yourname@upi" className="form-input" />
                </div>
                <div>
                  <label className="label-xs">Company Logo</label>
                  <div className="flex items-center gap-3">
                    {company.logoBase64 && <img src={company.logoBase64} alt="Logo" className="h-10 w-10 object-contain rounded bg-white/5 p-1" />}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs text-white/50 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-500/10 file:text-violet-400 hover:file:bg-violet-500/20 transition-all" />
                    {company.logoBase64 && <button type="button" onClick={() => setComp("logoBase64", "")} className="text-xs text-red-400 hover:text-red-300">Remove</button>}
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Invoice Meta */}
          <Section title="Invoice Details" icon={Hash}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div><label className="label-xs">Invoice No.</label><input value={form.invoiceNumber} onChange={e => setField("invoiceNumber", e.target.value)} className="form-input font-mono text-sm" /></div>
              <div><label className="label-xs">Date</label><input type="date" value={form.date} onChange={e => setField("date", e.target.value)} className="form-input font-mono text-sm" /></div>
              <div><label className="label-xs">Due Date</label><input type="date" value={form.dueDate} onChange={e => setField("dueDate", e.target.value)} className="form-input font-mono text-sm" /></div>
              <div>
                <label className="label-xs">Currency</label>
                <select value={form.currency} onChange={e => setField("currency", e.target.value)} className="form-input text-sm font-mono">
                  {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-[#1a1d2e]">{c.code} ({c.symbol})</option>)}
                </select>
              </div>
              <div>
                <label className="label-xs">Payment Method</label>
                <select value={form.paymentMethod} onChange={e => setField("paymentMethod", e.target.value)} className="form-input text-sm">
                  <option value="" className="bg-[#1a1d2e]">Select...</option>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m} className="bg-[#1a1d2e]">{m}</option>)}
                </select>
              </div>
            </div>
            {/* Status */}
            <div>
              <label className="label-xs">Status</label>
              <div className="flex gap-2">
                {["Pending", "Paid", "Overdue"].map(s => {
                  const c = STATUS[s];
                  return <button key={s} type="button" onClick={() => setField("status", s)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${form.status === s ? `${c.bg} ${c.text} ${c.border}` : "bg-transparent border-white/10 text-white/40 hover:border-white/20"}`}>{s}</button>;
                })}
              </div>
            </div>
          </Section>

          {/* Client Details */}
          <Section title="Client Details" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="label-xs">Client Name *</label><input value={form.clientName} onChange={e => setField("clientName", e.target.value)} placeholder="John Doe" className="form-input" /></div>
              <div><label className="label-xs">Client Email *</label><input type="email" value={form.clientEmail} onChange={e => setField("clientEmail", e.target.value)} placeholder="john@example.com" className="form-input" /></div>
              <div><label className="label-xs">Client Phone</label><input value={form.clientPhone} onChange={e => setField("clientPhone", e.target.value)} placeholder="+91 98765 43210" className="form-input" /></div>
            </div>
            <div><label className="label-xs">Client Address</label><textarea value={form.clientAddress} onChange={e => setField("clientAddress", e.target.value)} rows={2} className="form-input resize-none" placeholder="Street, City, State, PIN" /></div>
          </Section>

          {/* Line Items */}
          <Section title="Line Items" icon={Receipt}>
            <div className="space-y-3">
              {form.items.map((item, i) => <ItemRow key={i} item={item} index={i} onChange={setItem} onRemove={removeItem} canRemove={form.items.length > 1} />)}
            </div>
            <button type="button" onClick={addItem} className="mt-2 flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"><Plus size={14} /> Add Item</button>
          </Section>

          {/* Tax & Discount */}
          <Section title="Tax & Discount" icon={Percent}>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label-xs">GST (%)</label><input type="number" value={form.gstPercent} min={0} max={28} onChange={e => setField("gstPercent", e.target.value)} className="form-input font-mono text-sm" /></div>
              <div><label className="label-xs">Discount (%)</label><input type="number" value={form.discountPercent} min={0} max={100} onChange={e => setField("discountPercent", e.target.value)} className="form-input font-mono text-sm" /></div>
            </div>
          </Section>

          {/* Notes & Terms */}
          <Section title="Notes & Terms" icon={StickyNote} defaultOpen={false}>
            <div><label className="label-xs">Notes (visible on PDF)</label><textarea value={form.notes} onChange={e => setField("notes", e.target.value)} rows={3} className="form-input resize-none text-sm" placeholder="Any additional notes for the client..." /></div>
            <div><label className="label-xs">Terms & Conditions</label><textarea value={form.terms} onChange={e => setField("terms", e.target.value)} rows={4} className="form-input resize-none text-sm" /></div>
          </Section>

          {/* Summary */}
          <div className="rounded-xl bg-violet-500/10 border border-violet-500/25 p-4 space-y-2">
            <div className="flex justify-between text-sm text-white/50"><span>Subtotal</span><span className="font-mono">{fmtCurrency(subtotal, form.currency)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-sm text-emerald-400"><span>Discount ({form.discountPercent}%)</span><span className="font-mono">-{fmtCurrency(discountAmount, form.currency)}</span></div>}
            {gstAmount > 0 && (
              <>
                <div className="flex justify-between text-xs text-white/40"><span>CGST ({form.gstPercent / 2}%)</span><span className="font-mono">{fmtCurrency(gstAmount / 2, form.currency)}</span></div>
                <div className="flex justify-between text-xs text-white/40"><span>SGST ({form.gstPercent / 2}%)</span><span className="font-mono">{fmtCurrency(gstAmount / 2, form.currency)}</span></div>
              </>
            )}
            <div className="border-t border-violet-500/20 pt-2 mt-1 flex justify-between">
              <span className="text-white font-bold text-sm">Grand Total</span>
              <span className="font-mono font-bold text-violet-300 text-xl">{fmtCurrency(grandTotal, form.currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 border-t border-white/10 px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-2 bg-[#0d0f1a]">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-medium transition-all">Cancel</button>
          <button onClick={handlePDF} className="flex-1 py-2.5 rounded-xl bg-[#252836] hover:bg-[#2d3044] border border-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"><Eye size={14} /> Preview PDF</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#252836] hover:bg-[#2d3044] border border-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-all">{saving && <Loader2 size={14} className="animate-spin" />} Save</button>
          <button onClick={handleSaveAndDownload} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-lg shadow-violet-500/20"><Download size={14} /> Save & PDF</button>
        </div>
      </div>
    </div>
  );
};

// ── Invoice Row (responsive card on mobile, table row on desktop) ─────────────
const InvoiceRow = ({ invoice, onEdit, onDelete, onDownload, onEmail, onStatusChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices/${invoice.id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) { toast.success("Invoice deleted"); onDelete(); } else toast.error("Delete failed");
    } catch { toast.error("Network error"); }
    setDeleting(false); setMenuOpen(false);
  };

  // Mobile card
  return (
    <>
      {/* Desktop Row */}
      <tr className="hidden md:table-row border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
        <td className="px-5 py-4"><span className="font-mono text-xs text-violet-400 font-bold">{invoice.invoiceNumber}</span></td>
        <td className="px-5 py-4"><p className="text-white text-sm font-medium">{invoice.clientName}</p><p className="text-white/40 text-xs">{invoice.clientEmail}</p></td>
        <td className="px-5 py-4 text-white/50 text-xs font-mono">{fmtDate(invoice.date)}</td>
        <td className="px-5 py-4 text-white/50 text-xs font-mono">{fmtDate(invoice.dueDate)}</td>
        <td className="px-5 py-4"><span className="font-mono font-bold text-white text-sm">{fmtCurrency(invoice.totalAmount, invoice.metadata?.currency || "INR")}</span></td>
        <td className="px-5 py-4"><StatusBadge status={invoice.status} /></td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button title="Edit" onClick={() => onEdit(invoice)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"><Pencil size={13} /></button>
            <button title="Download PDF" onClick={() => onDownload(invoice)} className="p-1.5 rounded-lg text-white/40 hover:text-violet-400 hover:bg-violet-500/10 transition-all"><Download size={13} /></button>
            <button title="Email" onClick={() => onEmail(invoice)} className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Send size={13} /></button>
            <div className="relative">
              <button
                title="More"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all shadow-sm"
              >
                <MoreHorizontal size={14} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 bg-[#1a1d2e] border border-white/10 rounded-xl p-1.5 z-50 min-w-[160px] shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-3 py-1.5 mb-1 border-b border-white/5">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Manage Invoice</p>
                    </div>
                    {["Pending", "Paid", "Overdue"].map(s => {
                      const c = STATUS[s];
                      const I = c.icon;
                      return (
                        <button
                          key={s}
                          onClick={() => { onStatusChange(invoice.id, s); setMenuOpen(false); }}
                          className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded-lg transition-all ${c.text} hover:${c.bg} group/item`}
                        >
                          <I size={12} className="group-hover/item:scale-110 transition-transform" />
                          <span className="font-medium">Mark as {s}</span>
                        </button>
                      );
                    })}
                    <div className="border-t border-white/10 mt-1.5 pt-1.5">
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded-lg text-red-400 hover:bg-red-500/10 transition-all group/del"
                      >
                        {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} className="group-hover/del:rotate-12 transition-transform" />}
                        <span className="font-medium">Delete Invoice</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </td>
      </tr>
      {/* Mobile Card */}
      <div className="md:hidden rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-violet-400 font-bold">{invoice.invoiceNumber}</p>
            <p className="text-white font-semibold text-sm mt-1">{invoice.clientName}</p>
            <p className="text-white/40 text-xs">{invoice.clientEmail}</p>
          </div>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/40">
            <span>{fmtDate(invoice.date)}</span> → <span>{fmtDate(invoice.dueDate)}</span>
          </div>
          <span className="font-mono font-bold text-white">{fmtCurrency(invoice.totalAmount, invoice.metadata?.currency || "INR")}</span>
        </div>
        <div className="flex gap-2 pt-1 border-t border-white/8">
          <button onClick={() => onEdit(invoice)} className="flex-1 py-2 rounded-lg bg-white/5 text-white/70 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/10 transition-all"><Pencil size={11} /> Edit</button>
          <button onClick={() => onDownload(invoice)} className="flex-1 py-2 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-violet-500/20 transition-all"><Download size={11} /> PDF</button>
          <button onClick={() => onEmail(invoice)} className="flex-1 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-blue-500/20 transition-all"><Send size={11} /> Email</button>
        </div>
      </div>
    </>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
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
    try { const r = await fetch(`${API_BASE_URL}/api/invoices`, { headers: getHeaders() }); if (r.ok) setInvoices(await r.json()); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);
  const fetchSettings = useCallback(async () => {
    try { const r = await fetch(`${API_BASE_URL}/api/settings`); if (r.ok) setSettings(await r.json()); } catch (e) { console.error(e); }
  }, []);
  useEffect(() => {
    fetchInvoices();
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id, status) => {
    try { const r = await fetch(`${API_BASE_URL}/api/invoices/${id}`, { method: "PUT", headers: getHeaders(), body: JSON.stringify({ status }) }); if (r.ok) { toast.success(`Marked as ${status}`); fetchInvoices(); } else toast.error("Failed"); } catch { toast.error("Network error"); }
  };
  const handleEmail = (inv) => {
    const storedCo = JSON.parse(localStorage.getItem("invoiceCompany") || "{}");
    const subject = encodeURIComponent(`Invoice ${inv.invoiceNumber} from ${storedCo.name || settings?.fullName || "Your Name"}`);
    const body = encodeURIComponent(`Hi ${inv.clientName},\n\nPlease find attached your invoice ${inv.invoiceNumber} for ${fmtCurrency(inv.totalAmount, inv.metadata?.currency || "INR")}.\n\nDue Date: ${fmtDate(inv.dueDate)}\n\nThank you!\n\n${storedCo.name || settings?.fullName || ""}`);
    window.open(`mailto:${inv.clientEmail}?subject=${subject}&body=${body}`, "_blank");
    toast.info(`Email draft opened for ${inv.clientEmail}`);
  };
  const handleDownload = (inv) => {
    const storedCo = JSON.parse(localStorage.getItem("invoiceCompany") || "{}");
    generateInvoicePDF(inv, { ...DEFAULT_COMPANY, ...storedCo }, 'download');
  };
  const handleSaved = () => { setFormOpen(false); setEditingInvoice(null); fetchInvoices(); };

  const filtered = useMemo(() => invoices.filter(inv => {
    const ms = !search || inv.clientName.toLowerCase().includes(search.toLowerCase()) || inv.clientEmail.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === "All" || inv.status === statusFilter;
    return ms && mst;
  }), [invoices, search, statusFilter]);

  const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.totalAmount, 0);
  const pendingAmount = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + i.totalAmount, 0);
  const overdueCount = invoices.filter(i => i.status === "Overdue").length;

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64 min-h-screen">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#161822] border-b border-[#252836] sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-white/60 hover:text-white rounded-lg"><Menu size={20} /></button>
          <h1 className="text-white font-bold flex-1">Invoices</h1>
          <button onClick={() => { setEditingInvoice(null); setFormOpen(true); }} className="p-2 bg-violet-600 text-white rounded-lg"><Plus size={16} /></button>
        </div>
        <div className="p-4 md:p-6 xl:p-8">
          {/* Desktop Header */}
          <div className="hidden md:flex items-start justify-between mb-8">
            <div><h1 className="text-3xl font-extrabold text-white">Invoice Generator</h1><p className="text-white/40 text-sm mt-1">Create, manage and send professional invoices with GST</p></div>
            <div className="flex items-center gap-3">
              <button onClick={fetchInvoices} className="p-2.5 rounded-xl bg-[#252836] border border-white/10 text-white/40 hover:text-white transition-all"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /></button>
              <button onClick={() => { setEditingInvoice(null); setFormOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"><Plus size={16} /> New Invoice</button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Invoices", value: invoices.length, icon: FileText, color: "violet", mono: false },
              { label: "Revenue Earned", value: fmtCurrency(totalRevenue), icon: IndianRupee, color: "emerald", mono: true },
              { label: "Pending Amount", value: fmtCurrency(pendingAmount), icon: Clock, color: "amber", mono: true },
              { label: "Overdue", value: overdueCount, icon: AlertCircle, color: "red", mono: false },
            ].map(({ label, value, icon: StatIcon, color, mono }) => (
              <div key={label} className={`flex items-center gap-3 px-4 py-4 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                {StatIcon && <StatIcon size={18} className={`text-${color}-400 shrink-0`} />}
                <div><p className="text-white/40 text-xs leading-tight">{label}</p><p className={`text-white font-bold text-sm ${mono ? "font-mono" : ""}`}>{value}</p></div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client, email or invoice…" className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#161822] border border-white/10 focus:border-violet-500/40 focus:outline-none text-white text-sm placeholder-white/25 transition-colors" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {["All", "Pending", "Paid", "Overdue"].map(s => {
                const c = s !== "All" ? STATUS[s] : null;
                return <button key={s} onClick={() => setStatusFilter(s)} className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${statusFilter === s ? (c ? `${c.bg} ${c.text} ${c.border} border` : "bg-violet-600 text-white") : "bg-[#161822] border border-white/10 text-white/40 hover:text-white hover:border-white/20"}`}>{s}</button>;
              })}
            </div>
          </div>

          {/* Table / Cards */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f1a]">
            {loading ? (
              <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-violet-400" /></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4"><Receipt size={28} className="text-violet-400" /></div>
                <h3 className="text-white font-bold text-xl mb-2">{invoices.length === 0 ? "No Invoices Yet" : "No Results Found"}</h3>
                <p className="text-white/40 text-sm mb-6 max-w-xs">{invoices.length === 0 ? "Create your first invoice to start tracking payments." : "Try adjusting your filters."}</p>
                {invoices.length === 0 && <button onClick={() => { setEditingInvoice(null); setFormOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all"><Plus size={15} /> Create Invoice</button>}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto min-h-[450px]" data-lenis-prevent>
                    <div className="inline-block min-w-full align-middle pb-32">
                      <table className="w-full min-w-[700px] border-collapse">
                        <thead>
                          <tr className="border-b border-white/8 bg-white/[0.02]">
                            {["Invoice #", "Client", "Date", "Due Date", "Amount", "Status", "Actions"].map(h => (
                              <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filtered.map(inv => (
                            <InvoiceRow
                              key={inv.id}
                              invoice={inv}
                              onEdit={i => { setEditingInvoice(i); setFormOpen(true); }}
                              onDelete={fetchInvoices}
                              onDownload={handleDownload}
                              onEmail={handleEmail}
                              onStatusChange={handleStatusChange}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden p-3 space-y-3">
                  {filtered.map(inv => <InvoiceRow key={inv.id} invoice={inv} onEdit={i => { setEditingInvoice(i); setFormOpen(true); }} onDelete={fetchInvoices} onDownload={handleDownload} onEmail={handleEmail} onStatusChange={handleStatusChange} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {formOpen && <InvoiceForm invoice={editingInvoice} onClose={() => { setFormOpen(false); setEditingInvoice(null); }} onSaved={handleSaved} settings={settings} />}
    </div>
  );
};

export default InvoiceGenerator;
