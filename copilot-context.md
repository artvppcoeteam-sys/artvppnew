Here is your comprehensive base prompt:

---

## 🎨 Artwork Submission Form — Base Prompt for AI Generation

---

**You are building a production-ready artwork submission form for an art commerce website. This form will be sent directly to students via a link and cannot be modified after deployment. Apply all necessary security measures, input validation, and UX best practices throughout.**

---

### SECURITY REQUIREMENTS (Non-Negotiable)

* All inputs must be sanitized and validated on both client and server side
* Passwords must be hashed (bcrypt or similar) — never stored in plain text
* Implement CSRF token protection on form submission
* Rate limiting on form submission to prevent spam/abuse
* File uploads (profile picture, artwork images) must:

  * Accept only whitelisted MIME types (JPEG, PNG, WebP)
  * Be scanned/validated for malicious content
  * Have a strict file size limit (e.g., max 10MB per image)
  * Be renamed with a UUID on the server — never use the original filename
* Username must be checked for uniqueness via debounced async API call
* Form tokens should expire after a set duration (e.g., 30 minutes of inactivity)
* Terms & Conditions checkbox must be server-side verified — not just frontend
* Protect against XSS, SQL Injection, and IDOR vulnerabilities
* All API calls from the form must go through authenticated backend endpoints — never expose raw database or third-party API keys on the frontend

---

### SECTION 1 — USER INFORMATION

Collect the following fields:

* **Profile Picture** — Image upload (JPEG/PNG/WebP only, max 10MB, preview before submit)
* **Display Name** — Text input, max 60 characters
* **Username** — Text input, alphanumeric + underscore only, real-time uniqueness check via API, no spaces
* **Email** — Email input with format validation, must be unique in system
* **Phone Number** — With country code selector, numeric only, validate format per country
* **Password** — Min 6 characters, must contain uppercase, lowercase, number.
* **Confirm Password** — Must match password field exactly, validated live

---

### SECTION 2 — ADDRESS INFORMATION

* **Country** — Dropdown,
* **State** — Dropdown,
* **City** — Dropdown,
* **Pincode / ZIP Code** —
* **Actual Address** — Textarea, max 300 characters

---

### SECTION 3 — PRODUCT / ARTWORK SUBMISSION

The user can submit multiple artworks using an **"Add Another Artwork"** button. Each artwork block collects the following, and fields change dynamically based on the selected category.

#### Common Fields (All Categories):

* **Category** — Dropdown (values listed below)
* **Title** — Text input, max 120 characters
* **Size** — Text or structured input (e.g., Width × Height in cm/inches)
* **Medium / Material** — Text input or dropdown

---

#### Category-Specific Fields:

---

**1. Paintings**

* Frame option: `With Frame` / `Without Frame` (radio)
* **If With Frame:**

  * Size with frame (W × H)
  * Size without frame (W × H)
  * Price with frame
  * Frame material / description
  * Medium (e.g., oil, acrylic, watercolour)
* **If Without Frame:**

  * Size without frame (W × H)
  * Medium

---

**2. Photographs**

* Frame option: `With Frame` / `Without Frame` (radio)
* **If With Frame:**

  * Size with frame (W × H)
  * Size without frame (W × H)
  * Price with frame
  * Frame material / description
  * Print medium (e.g., glossy, matte, canvas)
* **If Without Frame:**

  * Size without frame (W × H)
  * Print medium
* **License Type** — Dropdown: `Personal Use` / `Commercial Use` / `Editorial Use` / `Exclusive Rights`

---

**3. Calligraphy Artworks**

* Frame option: `With Frame` / `Without Frame` (radio)
* If with frame: same frame detail fields as Paintings
* If without frame: size + medium
* **Script style** (e.g., Arabic, Devanagari, Latin, Urdu)
* **License Type** — Dropdown: `Personal Use` / `Commercial Use` / `Editorial Use` / `Exclusive Rights`

---

**4. Digital Art**

* File format (JPEG, PNG, SVG, TIFF)
* Resolution (DPI)
* Dimensions (px or cm)
* Delivery method (Digital Download / Print-on-Demand)
* **License Type** — Dropdown: `Personal Use` / `Commercial Use` / `Editorial Use` / `Exclusive Rights`

---

**5. Prints**

* Print type (Giclée, Screen Print, Lithograph, etc.)
* Edition type (`Open Edition` / `Limited Edition`)
* If Limited Edition: Edition number (e.g., 3/50)
* Paper/substrate type
* Size (W × H)
* Frame option: `With Frame` / `Without Frame`
* If With Frame: frame details (same as Paintings)

---

**6. Metal Art & Craft**

* Material (Copper, Brass, Aluminium, Iron, Mixed Metal, etc.)
* Technique (Embossing, Engraving, Casting, Welding, etc.)
* Dimensions (L × W × H)
* Weight (kg/grams)
* Finish type (Polished, Oxidised, Painted, Raw)
* Is it wall-mounted or freestanding? (Radio)

---

**7. Mural Art**

* Mural medium (Paint, Mosaic, Digital Print on Wall, etc.)
* Dimensions / Scale (sq. ft or sq. m)
* Surface type (Wall, Canvas, Board)
* Is this an original or a reproduction? (Radio)
* Availability type (Commission Only / Print Available)

---

**8. Handicrafts**

* Craft type (Pottery, Weaving, Jewellery, Woodwork, Textile, etc.)
* Materials used
* Dimensions (L × W × H)
* Weight
* Handmade certification (Checkbox: "I confirm this is handmade")
* Quantity available

---

**9. Sketches**

* Sketch medium (Pencil, Charcoal, Ink, Pastel, Conte, etc.)
* Paper type
* Size (W × H)
* Frame option: `With Frame` / `Without Frame`
* If With Frame: full frame details (same structure as Paintings)
* If Without Frame: size + medium

---

### ARTWORK IMAGE UPLOAD (All Categories)

* Minimum 1 image, maximum 6 images per artwork
* Accepted formats: JPEG, PNG, WebP
* Max file size per image: 10MB
* At least one image must be marked as the **cover/primary image**
* Show image previews before submission
* Validate dimensions: minimum 800×800px recommended (warn, do not block)

---

### SECTION 4 — TERMS & CONDITIONS

* A scrollable Terms & Conditions text box must appear before the submit button
* A checkbox: *"I have read and agree to the Terms & Conditions and Privacy Policy"*
* This checkbox is **required** — form must not submit without it
* This must also be validated server-side

---

### UX & FORM BEHAVIOR REQUIREMENTS

* Multi-step or single long-scroll form — your choice, but progress must be clearly indicated
* All required fields marked with `*`
* Inline real-time validation with helpful error messages (not just "invalid input")
* Disable the Submit button until all required fields pass validation
* Show a loading/spinner state during submission
* On success: show a confirmation message with a submission reference ID
* On failure: show specific error messages without resetting the entire form
* Auto-save draft to localStorage every 30 seconds so students don't lose progress
* Form must be fully responsive (mobile-first)
* Accessible: proper `aria-label`, `role`, tab order, and keyboard navigation

---

### CATEGORY DROPDOWN VALUES

```
Calligraphy Artworks
Digital Art
Metal Art & Craft
Mural Art
Paintings
Photographs
Prints
Handicrafts
Sketches
```

---
### ADMIN REVIEW
after the form is submited buy the user it will then go to admin for review after that the admin can approve/reject/remove it(it follows same process & every option it has for normal post submission by an verified artist)
