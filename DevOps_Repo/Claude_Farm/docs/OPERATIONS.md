# FarmConnect SA — Operations Playbook

**Last Updated:** May 2026  
**Owner:** Head of Operations

---

## 1. Daily Rhythm

### 05:00 — Pre-Collection Check
- Ops admin confirms all field agents have received their collection assignments
- Verify driver availability for all scheduled deliveries
- Check cold room temperature logs from overnight

### 06:00-09:00 — Collection Window
- Field agents arrive at cooperative collection points
- Grade produce, photograph, confirm weight
- Driver departs for Gauteng on N1 by 09:00 latest (to meet restaurant pre-service window)

### 10:00 — Dispatch Confirmation
- Ops admin confirms all loads dispatched in the system
- WhatsApp notification sent to restaurants: "Your order is on the way — ETA [time]"

### 11:00-14:00 — Delivery Window
- Driver makes drop stops at restaurants
- Each stop: driver phones ahead, restaurant signs off delivery
- Ops admin marks each stop delivered as confirmations come in

### 14:00 — Delivery Reconciliation
- All stops should be marked delivered or have an explanation
- Trigger payout jobs for confirmed deliveries (48-hour clock starts)
- Invoice auto-generated and emailed to buyer

### 16:00 — Dispute Window Opens
- Buyers have 24 hours to raise disputes
- Monitor for incoming disputes and triage

### 17:00 — End of Day Report
- Ops admin reviews: GMV delivered, outstanding payouts, open disputes
- Flag anything that will breach a SLA

---

## 2. Quality Control Process

### At Collection (Field Agent)

1. **Receive** the produce from the cooperative representative
2. **Weigh** using a certified scale — record actual weight
3. **Grade** a representative sample (min 10% of the load):
   - Size uniformity (visual)
   - Colour consistency (visual)
   - Blemish percentage (count per 10kg sample)
   - Evidence of disease or rot (zero tolerance)
4. **Photograph** the load:
   - Overview shot of pallets / crates
   - Close-up of sample produce
   - Scale reading with weight visible
   - Any defects found
5. **Record** in the grading form (offline queue if no signal)
6. **Sign off** the collection in the app — cooperative representative also signs physical receipt
7. **Reject** if: > 15% blemish on a Grade A order, visible rot > 2%, or weight short by > 5%

### Grading Standards

| Grade | Size Uniformity | Blemish Max | Notes |
|-------|----------------|-------------|-------|
| A | > 90% | < 5% | Restaurant quality — whole, uniform |
| B | > 75% | < 15% | Processing or catering — minor variation |
| C | No requirement | < 30% | Processing only — excluded from MVP |

### At Delivery (Driver + Restaurant)

- Driver presents delivery note with grade, weight, and farm origin
- Restaurant representative inspects visually
- Signed delivery note returned to driver (photographed and uploaded)
- Any on-site concerns raised immediately to ops admin (not via dispute form)

---

## 3. Logistics Flow

```
COOPERATIVE (Tzaneen/Limpopo)
    │
    │  Collection by field agent (06:00-08:00)
    ▼
CONSOLIDATION POINT
(Cooperative's existing cold room or FarmConnect-rented space)
    │
    │  Contracted refrigerated truck departs (by 09:00)
    │  N1 highway, Johannesburg ~5.5 hours
    ▼
GAUTENG MICRO-HUB
(Cold room access — Johannesburg North)
    │
    │  Sort and load for last-mile drops (12:00-13:00)
    ▼
RESTAURANT DROPS (Sandton, Rosebank, Melrose)
    │  Route-optimised sequence
    │  11:00-14:00 delivery window
    ▼
DELIVERY CONFIRMATION
    │
    ▼
48-HOUR FARMER PAYOUT CLOCK STARTS
```

### Logistics Partners

| Role | Provider | Contact | Backup |
|------|----------|---------|--------|
| N1 refrigerated transport | [TBD — to be contracted] | [TBD] | [Backup transporter] |
| Gauteng cold room | [TBD] | [TBD] | [Backup cold room] |
| Last-mile delivery | Same N1 truck on delivery run | — | Courier service |

### Transport SLAs

- Temperature: 8-12°C for tomatoes throughout transit
- Departure: No later than 09:00 from collection point
- Delivery window: 11:00-14:00 (restaurant prep time)
- Temperature breach: Reject load; contact cooperative and buyer immediately

---

## 4. Payment Flow

### Buyer Payment (Ozow EFT)

```
1. Buyer places order → system creates PENDING_PAYMENT order
2. Redirect to Ozow payment page (instant EFT)
3. Ozow webhook fires → payment status updated to COMPLETED
4. Order status advances to CONFIRMED
5. WhatsApp sent to buyer: "Order confirmed, delivery [date]"
```

- Payment terms: Cash on order (default) or 7-day credit (approved buyers only)
- Failed payment: Order held in PENDING_PAYMENT for 1 hour, then auto-cancelled

### Farmer Payout (Stitch Account-to-Account)

```
1. Delivery stop confirmed by ops admin
2. BullMQ job enqueued: process-payout (due 48 hours from confirmation)
3. At due time: Stitch API called → payout initiated
4. Stitch webhook fires → payment record updated to COMPLETED
5. WhatsApp sent to cooperative: "Payment of RX,XXX.XX sent to your account"
```

- Payout amount: Farm gate price × actual weight confirmed at collection
- FarmConnect commission deducted at settlement (not from payout — we invoice buyers separately)
- Commission rate: 5% seller + 8% buyer (blended ~10-11%)
- VAT: 15% on our service fee portion. Fresh produce itself is zero-rated.

### 48-Hour SLA Monitoring

Every morning at 08:00, an automated job checks for any payouts where:
- `dueAt < now + 2 hours` AND `status = PENDING`

These are flagged in the admin dashboard as **URGENT — SLA AT RISK**.

---

## 5. Dispute Resolution

### Timeline

| Hour | Action |
|------|--------|
| 0 | Delivery confirmed |
| 0-24 | Buyer may raise dispute |
| 24 | Dispute window closes (no new disputes) |
| 24-48 | Ops admin reviews: photos, grade record, field agent notes |
| 48 | Resolution issued (refund, credit, or rejection) |
| 48+ | Refund processed if applicable |

### Resolution Options

| Outcome | When | Action |
|---------|------|--------|
| Full refund | Produce clearly wrong grade or not delivered | Cancel buyer payment; issue payout to farmer if not their fault |
| Partial refund | Mixed quality or short delivery | Refund the deficit; farmer payout adjusted |
| Credit note | Buyer wants credit on next order | Note attached to buyer account |
| Rejection | Dispute not substantiated by evidence | Order marked resolved; no action |

### Evidence Required

- Buyer: photos within 24 hours, specific description
- Field agent grade record: automatically attached to case
- Driver delivery note: retrieved from system

---

## 6. Onboarding Playbook

### Onboarding a Cooperative (Field Agent)

1. Initial farm visit (field agent + operations manager)
2. Verify: CIPC registration, bank account, cooperative leadership contact
3. Explain grading standards — leave printed quality guide
4. WhatsApp group: cooperative contact, field agent, ops admin
5. First listing: field agent assists via web or phone
6. First test collection: field agent present for the full process
7. Cooperative approved in system: `isVerified = true`

**Target time from first contact to first collection: 7 days**

### Onboarding a Restaurant (Sales Rep)

1. Visit between 14:00-16:00 (between lunch and dinner service)
2. WhatsApp price comparison sheet (our price vs. their current market price)
3. Leave a physical produce sample (tomatoes, Grade A)
4. Follow up within 48 hours for trial order
5. First order: sales rep present at delivery to handle any issues
6. Standing order discussion after second successful delivery

**Target time from first contact to first order: 5 days**

---

## 7. Escalation Matrix

| Situation | First Contact | Escalation |
|-----------|---------------|-----------|
| Driver no-show | Ops admin → backup transporter | CEO if not resolved in 1 hour |
| Temperature breach | Ops admin → cooperative | Notify buyers, determine whether to proceed or cancel |
| Payment failure (Ozow down) | Retry after 30 min → Stitch fallback | Manual EFT if both fail |
| Payout SLA at risk | Ops admin → manual Stitch trigger | CEO + CFO notification |
| Food safety complaint | Ops admin → CEO immediately | Isolate batch, contact all buyers of that collection |
| Data breach (POPIA) | CTO → CEO | Notify Information Regulator within 72 hours |

---

## 8. Weekly Reporting

Every Monday morning, ops admin sends to the leadership team:

- **GMV last week** (total delivered order value)
- **Volume (kg)** delivered vs. previous week
- **Active restaurants** (ordered in last 7 days)
- **Cooperative performance** (collection confirmed rate, grade pass rate)
- **Payment SLA** (any breaches? payout delays?)
- **Disputes** (opened, resolved, pending)
- **Contribution margin per kg** (vs. target of R1.25/kg)
- **Top issues** and corrective actions

Template: `scripts/weekly-report-template.md`
