import React, { useEffect, useState, useRef } from "react";
import { Layout } from "../../components/layout/Layout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { getRecruiterProfileApi, updateRecruiterProfileApi } from "../../api/profile";
import "./RecruiterProfile.css";

const COMPANY_SIZES = [
  "1-10", "11-50", "51-200", "201-500",
  "501-1000", "1001-5000", "5000+"
];

const INDUSTRIES = [
  "Information Technology", "Finance & Banking", "Healthcare",
  "E-Commerce", "Education", "Manufacturing", "Consulting",
  "Media & Entertainment", "Real Estate", "Retail", "Logistics",
  "Telecommunications", "Automobile", "Other"
];


function Section({ title, icon, children }) {
  return (
    <div className="rp-section">
      <div className="rp-section-header">
        <span className="rp-section-icon">{icon}</span>
        <h3 className="rp-section-title">{title}</h3>
      </div>
      <div className="rp-section-body">{children}</div>
    </div>
  );
}


function FieldRow({ label, value, placeholder = "Not set" }) {
  return (
    <div className="rp-field-row">
      <span className="rp-field-label">{label}</span>
      <span className={`rp-field-value ${!value ? "rp-field-empty" : ""}`}>
        {value || placeholder}
      </span>
    </div>
  );
}


function CompletenessBar({ profile }) {
  const fields = [
    "firstName", "lastName", "phone", "designation",
    "companyName", "companyWebsite", "industry",
    "companySize", "companyLocation", "companyDescription", "companyLogo"
  ];
  const filled = fields.filter(f => profile?.[f]).length;
  const pct    = Math.round((filled / fields.length) * 100);

  return (
    <div className="rp-completeness">
      <div className="rp-completeness-top">
        <span className="rp-completeness-label">Profile Completeness</span>
        <span className="rp-completeness-pct">{pct}%</span>
      </div>
      <div className="rp-completeness-track">
        <div className="rp-completeness-fill" style={{ width: `${pct}%` }} />
      </div>
      {pct < 100 && (
        <p className="rp-completeness-hint">
          Complete your profile to attract better candidates
        </p>
      )}
    </div>
  );
}

export function RecruiterProfile() {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error,   setError]     = useState("");
  const [form,    setForm]      = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const logoRef = useRef(null);


  useEffect(() => {
    getRecruiterProfileApi()
      .then(res => {
        const p = res.data.data;
        setProfile(p);
        setForm({
          firstName:          p.firstName          || "",
          lastName:           p.lastName           || "",
          phone:              p.phone              || "",
          designation:        p.designation        || "",
          companyName:        p.companyName        || "",
          companyWebsite:     p.companyWebsite     || "",
          industry:           p.industry           || "",
          companySize:        p.companySize        || "",
          companyLocation:    p.companyLocation    || "",
          companyDescription: p.companyDescription || "",
        });
        if (p.companyLogo) {
          setLogoPreview(`http://localhost:5000/${p.companyLogo}`);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
  };

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (logoRef.current?.files?.[0]) {
        fd.append("companyLogo", logoRef.current.files[0]);
      }

      const res = await updateRecruiterProfileApi(fd);
      setProfile(res.data.data);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        firstName:          profile.firstName          || "",
        lastName:           profile.lastName           || "",
        phone:              profile.phone              || "",
        designation:        profile.designation        || "",
        companyName:        profile.companyName        || "",
        companyWebsite:     profile.companyWebsite     || "",
        industry:           profile.industry           || "",
        companySize:        profile.companySize        || "",
        companyLocation:    profile.companyLocation    || "",
        companyDescription: profile.companyDescription || "",
      });
      setLogoPreview(profile.companyLogo ? `http://localhost:5000/${profile.companyLogo}` : null);
    }
    setEditing(false);
    setError("");
  };

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) return (
    <Layout>
      <div className="rp-skeleton-page">
        <div className="rp-skeleton rp-sk-hero" />
        <div className="rp-skeleton rp-sk-card" />
        <div className="rp-skeleton rp-sk-card" />
      </div>
    </Layout>
  );

  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Your Name";
  const initials    = displayName === "Your Name" ? "?" :
    [profile?.firstName?.[0], profile?.lastName?.[0]].filter(Boolean).join("").toUpperCase();

  return (
    <Layout>
      <div className="rp-page fade-up">

        <div className="rp-hero">

          <div className="rp-hero-grid" />

          <div className="rp-hero-inner">
            <div className="rp-logo-wrap">
              <div className="rp-logo-ring">
                <div className="rp-logo-box">
                  {logoPreview
                    ? <img src={logoPreview} alt="Company logo" className="rp-logo-img" />
                    : <span className="rp-logo-initials">{initials}</span>
                  }
                </div>
              </div>
              {editing && (
                <>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    id="logo-upload"
                    style={{ display: "none" }}
                    onChange={handleLogoChange}
                  />
                  <label htmlFor="logo-upload" className="rp-logo-upload-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload Logo
                  </label>
                </>
              )}
            </div>

            {/* Name + meta */}
            <div className="rp-hero-info">
              <h1 className="rp-hero-name">{displayName}</h1>
              {profile?.designation && (
                <p className="rp-hero-designation">{profile.designation}</p>
              )}
              <div className="rp-hero-tags">
                {profile?.companyName && (
                  <span className="rp-hero-tag">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    </svg>
                    {profile.companyName}
                  </span>
                )}
                {profile?.companyLocation && (
                  <span className="rp-hero-tag">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {profile.companyLocation}
                  </span>
                )}
                {profile?.industry && (
                  <span className="rp-hero-tag">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    {profile.industry}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="rp-hero-actions">
              {!editing ? (
                <Button onClick={() => setEditing(true)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
              )}
            </div>
          </div>

          {/* Completeness bar */}
          <CompletenessBar profile={profile} />
        </div>

        {/* ── Success toast ───────────────────────────────── */}
        {success && (
          <div className="rp-toast rp-toast-success fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Profile updated successfully!
          </div>
        )}

        {/* ── Error banner ────────────────────────────────── */}
        {error && (
          <div className="rp-toast rp-toast-error fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        {/* ── View mode ───────────────────────────────────── */}
        {!editing && (
          <div className="rp-view fade-in">
            <Section title="Personal Info" icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            }>
              <div className="rp-field-grid">
                <FieldRow label="First Name"   value={profile?.firstName} />
                <FieldRow label="Last Name"    value={profile?.lastName} />
                <FieldRow label="Phone"        value={profile?.phone} />
                <FieldRow label="Designation"  value={profile?.designation} />
              </div>
            </Section>

            <Section title="Company Info" icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            }>
              <div className="rp-field-grid">
                <FieldRow label="Company Name"    value={profile?.companyName} />
                <FieldRow label="Company Website" value={profile?.companyWebsite} />
                <FieldRow label="Industry"        value={profile?.industry} />
                <FieldRow label="Company Size"    value={profile?.companySize ? `${profile.companySize} employees` : ""} />
                <FieldRow label="Location"        value={profile?.companyLocation} />
              </div>
              {profile?.companyDescription && (
                <div className="rp-about">
                  <p className="rp-about-label">About Company</p>
                  <p className="rp-about-text">{profile.companyDescription}</p>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* ── Edit mode ───────────────────────────────────── */}
        {editing && (
          <form onSubmit={handleSave} className="rp-form fade-in">

            {/* Personal Info */}
            <Section title="Personal Info" icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            }>
              <div className="rp-form-grid">
                <Input label="First Name" placeholder="John" value={form.firstName} onChange={set("firstName")} />
                <Input label="Last Name"  placeholder="Doe"  value={form.lastName}  onChange={set("lastName")} />
                <Input label="Phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} />
                <Input label="Designation" placeholder="HR Manager, Talent Acquisition..." value={form.designation} onChange={set("designation")} />
              </div>
            </Section>

            {/* Company Info */}
            <Section title="Company Info" icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            }>
              <div className="rp-form-grid">
                <Input label="Company Name *" placeholder="Infosys, TCS, Startup Inc..." value={form.companyName} onChange={set("companyName")} required />
                <Input label="Company Website" type="url" placeholder="https://yourcompany.com" value={form.companyWebsite} onChange={set("companyWebsite")} />
                <Input label="Company Location" placeholder="Bangalore, Mumbai, Remote..." value={form.companyLocation} onChange={set("companyLocation")} />

                {/* Industry dropdown */}
                <div className="rp-input-wrap">
                  <label className="rp-input-label">Industry</label>
                  <select className="rp-select" value={form.industry} onChange={set("industry")}>
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                {/* Company size dropdown */}
                <div className="rp-input-wrap">
                  <label className="rp-input-label">Company Size</label>
                  <select className="rp-select" value={form.companySize} onChange={set("companySize")}>
                    <option value="">Select Size</option>
                    {COMPANY_SIZES.map(s => (
                      <option key={s} value={s}>{s} employees</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* About Company textarea */}
              <div className="rp-input-wrap" style={{ marginTop: 16 }}>
                <label className="rp-input-label">About Company</label>
                <textarea
                  className="rp-textarea"
                  placeholder="Tell candidates what makes your company a great place to work..."
                  value={form.companyDescription}
                  onChange={set("companyDescription")}
                  rows={4}
                />
                <p className="rp-char-count">{form.companyDescription.length} / 1000</p>
              </div>
            </Section>

            {/* Save bar */}
            <div className="rp-save-bar">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Discard Changes
              </Button>
              <Button type="submit" loading={saving}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Profile
              </Button>
            </div>

          </form>
        )}

      </div>
    </Layout>
  );
}