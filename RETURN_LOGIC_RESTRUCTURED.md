# ✅ Return Logic Completely Restructured

## New Return Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER INITIATES RETURN                     │
└─────────────────────────────────────────────────────────────────┘
     ↓
     Customer fills return form with:
     • Name, Phone, Email
     • Reason for return
     • Product images (1-6)
     • Optional unboxing video
     
     POST /api/returns with images
     
     ↓ Status: PROCESSING ✈️
     └─→ Order Status: COMPLETED → RETURNED (unchanged yet)
     └─→ Customer gets email: "Return received - processing"


┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN REVIEWS RETURN                          │
│              (New Admin Returns Page - Full Details)             │
└─────────────────────────────────────────────────────────────────┘
     ↓
     Admin sees on /admin/returns:
     ✓ Customer name, email, phone  
     ✓ Order details (Order ID, total amount, items count)
     ✓ Return reason
     ✓ Product images (clickable to view full size)
     ✓ All metadata
     
     Admin clicks: "Approve Return Request" OR "Reject Request"


     ┌──── IF APPROVED ────┐
     ↓                     ↓ IF REJECTED
     Status: RETURN_REQUEST_APPROVED        ❌ Status: REJECTED
     
     Email to customer with:
     • Refund amount: ₹XXXX (product price only)
     • Warehouse address to send package
     • Customer must include Order ID when shipping
     
     ┌──────────────────────────────────────────────┐
     │    CUSTOMER SHIPS PRODUCT TO WAREHOUSE       │
     │                                              │
     │ Using provided warehouse address:            │
     │ - Name: Sri Vaari Mobiles Warehouse          │
     │ - Address: [configured in backend]           │
     │ - Phone: [configured in backend]             │
     └──────────────────────────────────────────────┘
          ↓
     ADMIN RECEIVES PACKAGE AT WAREHOUSE
          ↓
     Admin clicks: "Mark as Received"
     Status: RECEIVED 📦
     
     Email to customer: "Package received - processing refund"


┌─────────────────────────────────────────────────────────────────┐
│              MANUAL REFUND PROCESSING (Admin)                    │
└─────────────────────────────────────────────────────────────────┘
     ↓
     Admin verifies product condition
     
     ADMIN MANUALLY SENDS MONEY TO CUSTOMER:
     • Transfer ₹XXXX to customer's bank/UPI
     • OR through PayTM/Google Pay/Cash
     • NO automatic Razorpay refund
     
     When money is sent, admin clicks:
     "💸 Manual Refund Processed"
     
     Confirmation popup:
     "Process manual refund of ₹15,000?
      Make sure you have sent the money to the customer."
     
     ↓
     Status: REFUNDED ✅
     Order status: REFUNDED
     
     Email to customer:
     "Refund processed - ₹XXXX sent to your account
      Allow 3-5 business days for amount to appear"

```

---

## Database Changes

### ReturnRequest Schema - New Fields

```javascript
// NEW STATUS ENUM (replaced old one)
status: {
  PROCESSING,              // Customer submitted - admin reviewing
  RETURN_REQUEST_APPROVED, // Approved - send package to warehouse
  RECEIVED,                // Warehouse received product
  REJECTED,                // Admin rejected
  REFUNDED,                // Manual refund processed
}

// NEW FIELDS
warehouseAddress: {        // Address where customer sends package
  name: String,
  phone: String,
  address: String,
  city: String,
  pincode: String
}

refundAmount: Number       // Calculated amount to refund
refundReason: String       // Reason for refund

refundProcessedBy: ObjectId // Admin who processed refund
refundProcessedAt: Date      // When refund was marked as complete

refundApprovedBy: ObjectId   // Admin who approved return
refundApprovedAt: Date       // When return was approved

adminNote: String          // Admin comments/reason for rejection
```

---

## Admin Returns Page - New UI

The admin returns page now displays:

✅ **Return ID** - Unique identifier
✅ **Status Badge** - Color-coded status with emoji
✅ **Customer Details** - Name, Email, Phone
✅ **Order Details** - Order ID, Total Amount, Item count
✅ **Return Reason** - Why customer wants to return
✅ **Product Images** - All submitted images (clickable to view full)
✅ **Warehouse Address** - Display when return is approved
✅ **Refund Amount** - Yellow badge showing refund amount
✅ **Admin Notes** - Show any rejection reason or comments

### Action Buttons Based on Status

| Status | Actions |
|--------|---------|
| PROCESSING | ✅ Approve Return Request<br>❌ Reject Request |
| RETURN_REQUEST_APPROVED | 📦 Mark as Received |
| RECEIVED | 💸 Manual Refund Processed |
| REFUNDED | ✅ Completed (show date) |
| REJECTED | ❌ Completed (show date) |

---

## Customer Journey Emails

### 1. Return Submitted
```
Subject: Return Request Received - Processing
Message: Your return request is being reviewed. You'll be notified once approved.
```

### 2. Return Approved ✅
```
Subject: Return Request Approved - Send Package Here
Message: 
  - Refund amount: ₹15,000
  - Warehouse address with full details
  - Instructions to include Order ID with package
```

### 3. Return Rejected ❌
```
Subject: Return Request Rejected
Message: 
  - Rejection reason (if provided)
  - Contact support link
```

### 4. Package Received 📦
```
Subject: Your Return Package Received
Message: 
  - Package received confirmation
  - Verification in progress
  - Refund will be processed soon
```

### 5. Refund Processed ✅
```
Subject: Refund Processed Successfully
Message:
  - Refund amount confirmed
  - Wait 3-5 business days
  - Money sent to original payment method
```

---

## Key Differences from Previous Logic

| Before | After |
|--------|-------|
| Automatic Razorpay refund | Manual refund (admin sends money) |
| Order status "REFUND_PROCESSING" | No automatic order status changes |
| Limited admin view | Full customer details + all metadata |
| Generic emails | Detailed emails with warehouse address |
| Auto-refund on "RECEIVED" | Manual confirmation required |

---

## Configuration

Update these environment variables in your `.env` file:

```env
# Warehouse Address (used in approval email)
WAREHOUSE_PHONE=+91-XXXX-XXXX-XX
WAREHOUSE_ADDRESS=Plot No. XYZ, Main Road
WAREHOUSE_CITY=Hyderabad
WAREHOUSE_PINCODE=500001
```

---

## Testing Checklist

- [ ] Customer can submit return with images
- [ ] Return request status shows "PROCESSING"
- [ ] Customer receives "processing" email
- [ ] Admin can see all return details on /admin/returns page
- [ ] Admin can approve return
- [ ] Customer receives approval email with warehouse address
- [ ] Admin can mark as "Received"
- [ ] Admin can process "Manual Refund"
- [ ] Order status changes to "REFUNDED"
- [ ] Customer receives refund confirmation email
- [ ] Admin can reject return with reason
- [ ] Rejected returns show in UI with reason

---

## Important Notes

✅ **No Razorpay Integration** - Refunds are 100% manual
✅ **Warehouse Address Configurable** - Set in environment variables
✅ **Full Transparency** - Admin sees complete customer info
✅ **Email Notifications** - Every step has email confirmation
✅ **Audit Trail** - Track who approved/processed refund and when
✅ **Optional Video** - Unboxing video remains optional
