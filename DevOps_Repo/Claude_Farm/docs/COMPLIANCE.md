# FarmConnect SA — Compliance Tracker

**Last Updated:** May 2026  
**Owner:** Platform Admin / Appointed DPO

---

## 1. Company Structure & Registration

| Requirement | Status | Owner | Notes |
|-------------|--------|-------|-------|
| Pty Ltd registration (Companies Act 71/2008) | [ ] Pending | CEO | CIPC registration required before launch |
| Tax number (SARS) | [ ] Pending | CEO | Required within 60 days of incorporation |
| VAT registration | [ ] Pending | CFO | Required when taxable turnover exceeds R1M (fresh produce zero-rated; service fees VAT-able at 15%) |
| PAYE registration (for employees) | [ ] Pending | CFO | Register when first employee hired |
| UIF registration | [ ] Pending | CFO | Mandatory for all employees |
| B-BBEE affidavit (EME) | [ ] Pending | CEO | Automatic Level 4 as EME; ≥51% black ownership → Level 1 |

---

## 2. POPIA (Protection of Personal Information Act 4 of 2013)

### Mandatory Actions

| Requirement | Status | Deadline | Owner |
|-------------|--------|---------|-------|
| Appoint Information Officer (DPO) | [ ] | Before launch | CEO |
| Register Information Officer with Information Regulator | [ ] | Within 30 days of appointment | DPO |
| Privacy Policy — written and published | [ ] | Before user registration goes live | DPO |
| POPIA consent captured on user registration | [ ] | Before launch | Dev |
| POPIA consent stored with timestamp in DB | [ ] | Before launch | Dev |
| Data Processing Agreement (DPA) with all processors (Ozow, Stitch, Clickatell, Cloudflare, Fly.io) | [ ] | Before launch | DPO |
| Data retention policy implemented in code | [ ] | Before launch | Dev |
| Data Subject Access Request (DSAR) process | [ ] | Before launch | DPO |
| Data breach notification procedure (72-hour rule) | [ ] | Before launch | DPO + CEO |
| Annual POPIA compliance audit | [ ] | Month 12 | DPO |

### Data Classification

| Data Type | Classification | Retention | Encryption |
|-----------|---------------|-----------|-----------|
| Name, phone, email | Personal | Active + 1yr | In transit (TLS) |
| Bank account numbers | Sensitive | Active + 7yr (SARS) | At rest (column-level) |
| FICA/KYC documents | Sensitive | Active + 5yr | At rest |
| Transaction records | Business | 7 years | In transit |
| Photos (produce) | Business | 12 months | At rest (R2) |
| Audit logs | Compliance | 7 years | At rest |

---

## 3. Financial Regulation

### National Payment System Act (NPS Act 78 of 1998)

FarmConnect does **not** hold client funds. All payment flows pass through licensed PSPs:
- **Ozow** — licensed under NPS Act for instant EFT
- **Stitch** — licensed for account-to-account transfers

Action: Obtain written confirmation from both PSPs that our use case does not require a separate licence.

| Requirement | Status | Owner |
|-------------|--------|-------|
| Ozow merchant agreement signed | [ ] | CEO |
| Stitch merchant agreement signed | [ ] | CEO |
| PSP confirmation of licence coverage | [ ] | CEO |
| No FarmConnect bank account holds buyer funds | [x] Architectural | Dev |

### FICA (Financial Intelligence Centre Act 38 of 2001)

Our PSPs handle FICA/KYC for transacting parties. We are responsible for:

| Requirement | Status | Owner |
|-------------|--------|-------|
| Collect ID/registration documents during onboarding | [ ] | Dev |
| Store KYC data securely per POPIA | [ ] | Dev |
| Pass KYC data to PSP for their FICA obligations | [ ] | Dev |
| Suspicious transaction reporting procedure (via PSP) | [ ] | CFO |

### VAT (Value-Added Tax Act 89 of 1991)

| Category | VAT Treatment |
|----------|--------------|
| Fresh produce (tomatoes, etc.) | Zero-rated (Section 11) |
| FarmConnect platform fee / commission | Standard-rated at 15% |
| Logistics coordination fee | Standard-rated at 15% |

Action: VAT registration trigger at R1M taxable (service fee) turnover — monitor monthly.

---

## 4. Agricultural Produce Agents Act (12 of 1992)

FarmConnect positions itself as a **technology marketplace**, not a market agent. Critical structural decisions:

| Agent Activity | FarmConnect Position |
|----------------|---------------------|
| Receiving produce on consignment | ✗ We do not take title or custody |
| Selling on behalf of farmers | ✗ Farmers list and price their own produce |
| Handling buyer funds as agent | ✗ Funds flow through licensed PSP |
| Taking a commission on sales | ✓ Our platform fee is a technology service fee, not an agency commission |

**Risk:** NAMC or a market agent could challenge this position. Mitigation: Legal opinion from an agricultural law firm before launch (budget: R30-50K).

| Action | Status | Owner |
|--------|--------|-------|
| Legal opinion: marketplace vs. agent classification | [ ] | CEO / Legal |
| Terms of Service explicitly stating FarmConnect is not an agent | [ ] | Legal |

---

## 5. B-BBEE (Broad-Based Black Economic Empowerment)

### Target Level

| Scenario | Level | Benefit |
|----------|-------|---------|
| EME (<R10M annual turnover), any ownership | Level 4 | Automatic |
| EME + ≥51% black ownership | Level 1 | Opens government procurement |

### B-BBEE Action Plan

| Action | Status | Owner |
|--------|--------|-------|
| Structure shareholding: ≥51% black ownership from incorporation | [ ] | CEO |
| AgriBEE Sector Code compliance review | [ ] | CEO / Legal |
| B-BBEE compliance certificate issued | [ ] | CEO |
| Supplier Development: onboarded smallholder cooperatives logged as SD spend | [ ] | OPS |
| Skills Development: field agent training hours logged | [ ] | OPS |
| Annual B-BBEE scorecard update | [ ] | CEO |

### Supplier Compliance Support
FarmConnect helps cooperative suppliers access their own B-BBEE status:
- Provide each cooperative with a "Supplier B-BBEE Certificate" showing FarmConnect's level
- Buyers can use this for their own procurement compliance reporting
- This is a selling point, not just a compliance tick

---

## 6. Food Safety

### Foodstuffs, Cosmetics and Disinfectants Act (54 of 1972)

FarmConnect does not physically handle produce — quality control is remote (photo + field agent verification). This avoids HACCP certification requirements.

| Requirement | Status | Notes |
|-------------|--------|-------|
| Confirm non-handler status with legal opinion | [ ] | Same opinion as market agent analysis |
| Field agent grading does not constitute "handling" for regulatory purposes | [ ] | Legal to confirm |
| Transport partners hold their own food safety certification | [ ] | Check during transporter vetting |

---

## 7. Employment Law

| Requirement | Status | Notes |
|-------------|--------|-------|
| Employment contracts for all staff | [ ] | Before first hire |
| Basic Conditions of Employment Act (BCEA) compliance | [ ] | HR on hire |
| Minimum wage compliance (National Minimum Wage Act) | [ ] | Field agents R25K/month — well above NMW |
| Independent contractor agreements for field agents (if not employees) | [ ] | Legal to advise on structure |

---

## 8. Data Localisation

POPIA does not prohibit data transfers abroad, but transfers to countries without adequate protection require conditions (Section 72).

| Processor | Location | Adequate Protection? | Action |
|-----------|----------|---------------------|--------|
| Fly.io (Johannesburg region) | ZA | Yes | ✓ Use JNB region |
| Cloudflare R2 | ZA bucket | Yes (if ZA-region) | Confirm bucket region is ZA |
| Upstash Redis | EU/US | No — DPA required | Obtain Upstash DPA with POPIA addendum |
| Clickatell | ZA HQ | Yes | ✓ |
| Ozow | ZA | Yes | ✓ |
| Stitch | ZA | Yes | ✓ |
| Sentry | US | No — DPA required | Enable data scrubbing; obtain Sentry DPA |
| SendGrid | US | No — DPA required | Obtain SendGrid DPA; scrub PII from email metadata |

---

## 9. Year 1 Compliance Budget

| Item | Estimated Cost |
|------|---------------|
| Legal opinion (market agent + food safety) | R30-50K |
| B-BBEE consultant + certificate | R15-25K |
| POPIA / DPO support (external) | R50-100K |
| Company registration + tax setup | R5-10K |
| Annual audit (if required) | R50-100K |
| Penetration test (Month 12) | R50-100K |
| **Total** | **R200-385K (low end — budget R500K for buffer)** |

---

## 10. Compliance Calendar

| Month | Action |
|-------|--------|
| 0 | Incorporate company; appoint DPO; obtain legal opinion on market agent status |
| 1 | Register Information Officer; publish Privacy Policy; PSP agreements signed |
| 2 | B-BBEE certificate; first POPIA-compliant onboarding flow live |
| 3 | VAT registration monitoring begins |
| 6 | Internal POPIA audit |
| 12 | External pen test; external POPIA review; annual B-BBEE update |
