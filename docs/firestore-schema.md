# Firestore structure

## categories/{slug}
- name (string), slug (string, same as doc id), image (string, path in /public), order (number)

## products/{slug}
- name, slug (same as doc id), description (string)
- price (number, whole naira, e.g. 45000)
- image (string, main image path like "/products/black-senator.jpg")
- images (array of strings, extra images, optional)
- categoryId (string, matches a category slug)
- sizes (array of strings, e.g. ["S","M","L"]), colors (array of strings)
- stock (number), featured (boolean), available (boolean)
- isSample (boolean, only on seeded demo data)
- createdAt, updatedAt (timestamps)

## orders/{reference}   (created in a later step)
- reference, customer { fullName, phone, address, city, state, notes }
- items [ { productId, name, price, quantity, size, color, image } ]  (snapshot at purchase time)
- subtotal, deliveryFee (null until the owner confirms), deliveryFeeStatus
- paymentStatus: pending | success | failed | abandoned
- fulfillmentStatus: pending | processing | ready_for_delivery | shipped | delivered | cancelled
- stockDeducted (boolean, prevents double deduction), paidAt, createdAt, updatedAt

## Admin access
- The owner is a Firebase Auth user with custom claim { admin: true }
- Admin API routes verify the ID token and the claim on the server