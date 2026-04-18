# تقرير توافق منصّة كليم

**تاريخ:** 2026-04-18  
**الفرع:** `claude/improve-mobile-app-nJrpj`  
**النطاق:** مراجعة توافق الـ API contract بين الباكند (Laravel) والفرونت (React/Vite) والموبايل (Expo).

## الريبوهات

| النوع | الريبو | الفرع الرئيسي | فرع العمل |
|-----|------|--------------|-----------|
| Backend (Laravel) | `Aqtar-Company/rafiq_backend` | `main` | `claude/improve-mobile-app-nJrpj` |
| Frontend (React) | `Aqtar-Company/kaleem-wellbeing-hub` | `main` | `claude/improve-mobile-app-nJrpj` |
| Mobile (Expo)    | `Aqtar-Company/kaleemmobileapp-final` | `main` | `claude/improve-mobile-app-nJrpj` |

**Base URL:** `https://api.kaleemai.com/api`

## ملخص العمل على الفرع

- 12 commit على ريبو الموبايل (إصلاحات api layer + شاشات جديدة + إزالة mock).
- 1 commit على ريبو الفرونت (إصلاح mark-as-read + تفريغ dummy seeds).
- الباكند لم نلمسه — الفرع منشأ فقط لتسجيل عدم وجود تغييرات.

## أقسام التقرير

1. Matched ✅ — الـ endpoints المتطابقة بين الثلاثة.
2. Fixed 🔧 — ما تم إصلاحه في هذا الفرع.
3. Missing ❌ — إما ناقص في الباكند أو في طبقة العميل.
4. Recommendations 📋 — توصيات للمرحلة القادمة.

---

## 1. Matched ✅

المسارات الموجودة في الباكند ويستخدمها كلا الموبايل والفرونت بنفس الطريقة.

### Auth

| Method | Path | Mobile | Frontend |
|--------|------|--------|----------|
| POST | `/register` | `services/auth.ts` | `AuthContext` |
| POST | `/login`    | `services/auth.ts` | `AuthContext` |
| GET  | `/user`     | `services/auth.ts` | `AuthContext.refreshUser` |
| POST | `/logout`   | `services/auth.ts` | `AuthContext` |
| POST | `/password/forgot` | `forgotPasswordApi` | `useAuth` |
| POST | `/password/reset`  | `resetPasswordApi` | `useAuth` |
| POST | `/change-password` | `changePasswordApi` | `useAuth` |

### Employees (المستشارين)

| Method | Path | Mobile | Frontend |
|--------|------|--------|----------|
| GET | `/employees` | `getConsultantsApi` | في صفحة `Consultants` |
| GET | `/employees/{id}` | `getConsultantApi` | في `ConsultantProfile` |
| GET | `/employees/{id}/available-times/{date}` | `getAvailableTimesApi` | في `BookingDialog` |

### Chat

| Method | Path | Mobile | Frontend |
|--------|------|--------|----------|
| GET  | `/chat` | `services/chat.ts` | `useChats` |
| GET  | `/chat/messages/{userId}` | `services/chat.ts` | `useChatMessages` |
| POST | `/chat/send-message` | ✅ | ✅ |
| POST | `/chat/typing` | ✅ | ✅ |
| POST | `/chat/service-offer/{id}/accept` | ✅ | ✅ |
| POST | `/chat/service-offer/{id}/reject` | ✅ | ✅ |

### Wallet

| Method | Path | Mobile | Frontend |
|--------|------|--------|----------|
| GET  | `/wallet` | `getWalletApi` | `PaymentsPage` |
| POST | `/wallet/deposit` | `depositApi` | مباشرة |
| POST | `/wallet/paypal/create-order` | ✅ | `DepositModal` |
| POST | `/wallet/paypal/capture-order` | ✅ | `DepositModal` |
| POST | `/wallet/paypal/verify-deposit` | ✅ | ✅ |
| POST | `/wallet/verify-payment` | `verifyPaymentApi` | ✅ |
| POST | `/wallet/withdraw` | ✅ | `WithdrawalModal` |
| POST | `/wallet/transfer-to-user` | ✅ | `TransferModal` |
| POST | `/wallet/refund` | ✅ | `RefundModal` |

### Session Packs

| Method | Path | Mobile | Frontend |
|--------|------|--------|----------|
| GET  | `/session-packs` | `getSessionPacksApi` (fixed mapper — section 2) | ⚠️ hardcoded (مهمة #11) |
| POST | `/session-packs/purchase` | `purchasePackApi` | — |
| POST | `/session-packs/consultant/{id}/purchase` | `purchaseConsultantPackApi` | `SessionPacksSection` |
| GET  | `/session-packs/my-balance` | `getMySessionBalanceApi` (fixed mapper) | `PaymentsPage` |

### AI Plans

| Method | Path | Mobile | Frontend |
|--------|------|--------|----------|
| GET  | `/ai-plans` | `getAiPlansApi` (fixed mapper) | ❌ مفقود (`section 3`) |
| GET  | `/ai-plans/my-subscription` | `getMySubscriptionApi` (fixed mapper) | `useKaleemSubscription` جزئي |
| POST | `/ai-plans/subscribe` | `subscribeAiPlanApi` | ❌ مفقود |
| POST | `/ai-plans/cancel` | `cancelAiPlanApi` | ❌ مفقود |

### Reservations

| Method | Path | Mobile | Frontend |
|--------|------|--------|----------|
| GET    | `/reservations` | `getReservationsApi` | موجود في Appointments |
| POST   | `/reservations` | `createReservationApi` | `BookingDialog` |
| GET    | `/reservations/{id}/join-token` | `getJoinTokenApi` | ❌ غير مستخدم (`section 3`) |
| DELETE | `/reservations/{id}` | `cancelReservationApi` | ✅ |

### Courses

| Method | Path | Mobile | Frontend |
|--------|------|--------|----------|
| GET  | `/courses` | `getCoursesApi` + شاشة جديدة (مهمة #6) | `/courses` page |
| GET  | `/courses/{id}` | `getCourseApi` + شاشة تفاصيل | `/courses/{id}` page |
| POST | `/courses/subscribe` | `subscribeCourseApi` | ✅ |

### Notifications

| Method | Path | Mobile | Frontend |
|--------|------|--------|----------|
| GET  | `/notifications` | `getNotificationsApi` | `NotificationsDropdown` + `NotificationsPage` |
| POST | `/notifications/mark-as-read` (all) | `markAllAsReadApi` (fixed) | ✅ (fixed — section 2) |
| POST | `/notifications/mark-as-read/{id}` | `markAsReadApi` (fixed) | ✅ |

### Lookup (Public)

| Method | Path | Mobile | Frontend |
|--------|------|--------|----------|
| GET | `/specializations` | `services/lookup.ts` | `useSpecializations` |
| GET | `/services` | `services/lookup.ts` | `useServices` |
| GET | `/countries` | `services/lookup.ts` | `useCountries` |
| GET | `/countries/{id}/cities` | `services/lookup.ts` | `useCities` |

> الأقسام 2-4 تُكمل في تاسكات 12.3 → 12.5.
