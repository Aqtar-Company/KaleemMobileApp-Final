# تقرير توافق منصّة كليم

**تاريخ:** 2026-04-18  
**الفرع:** `claude/improve-mobile-app-nJrpj`  
**النطاق:** مراجعة توافق الـ API contract بين الباكند (Laravel) والفرونت (React/Vite) والموبايل (Expo).

## الريبوهات

| النوع | الريبو | الفرع الرئيسي | فرع العمل |
|-----|------|--------------|----------|
| Backend (Laravel) | `Aqtar-Company/rafiq_backend` | `main` | `claude/improve-mobile-app-nJrpj` |
| Frontend (React) | `Aqtar-Company/kaleem-wellbeing-hub` | `main` | `claude/improve-mobile-app-nJrpj` |
| Mobile (Expo)    | `Aqtar-Company/kaleemmobileapp-final` | `main` | `claude/improve-mobile-app-nJrpj` |

**Base URL:** `https://api.kaleemai.com/api`

## ملخص العمل على الفرع

- 13 commit على ريبو الموبايل (إصلاحات api layer + شاشات جديدة + إزالة mock + التقرير).
- 4 commits على ريبو الفرونت (إصلاح mark-as-read + تفريغ dummy seeds + `useWalletBundles` hook + refactor الـ DepositModal + refactor الـ PricingSection).
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
| GET  | `/session-packs` | `getSessionPacksApi` (fixed mapper — section 2) | `useWalletBundles` (جديد — section 2.b) |
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

---

## 2. Fixed 🔧

### 2.a Mobile (`kaleemmobileapp-final`)

على فرع `claude/improve-mobile-app-nJrpj` — 12 commit تغطي الإصلاحات التالية:

#### 🔥 Critical: طبقة الـ API كانت مكسورة فعليًا

`services/api.ts` كان يفترض envelope `{ status, message, data }` لكل response — لكن عدة endpoints في الباكند ترجع payload مكشوف (`/session-packs`, `/ai-plans`, `/session-packs/my-balance`, `/ai-plans/my-subscription`). النتيجة: كل service بيفحص `!res.status` ويرمي خطأ "حدث خطأ" لكل استدعاءات هذه الـ endpoints.

**الإصلاح** (commit `d1cac8b`):
- أضيف `normalizeEnvelope()` يستوي 2xx responses: إذا فيها `status` تمر كما هي، وإلا يليف `{ status: true, message: "", data: <body> }`.
- `handleResponse` أصبح يقرأ الـ `text()` أولاً يمنع حوادث JSON.parse على responses فارغة.

#### 📐 Mapper fields غير متطابقة

| الملف | كان يتوقع | الباكند يرجع | الحل |
|------|---------|---------------|------|
| `services/sessionPacks.ts` | `online_sessions`, `written_consultations`, `ai_messages` (كأشياء `{total, used}`) | `sessions_count`, `free_written_sessions`, `ai_messages_credit` (مع `name_ar`, `description_ar`, `has_extended_chat`, `discount_percent`, `original_price_*`) | إعادة كتابة الـ `ApiSessionPack` + mapper |
| `services/aiPlans.ts`     | `messages_limit`, `has_extended_chat`, `features`       | `messages_per_month`, `is_unlimited`, `features_ar`, `billing_cycle`, `name_ar` | إعادة كتابة `ApiAiPlan` + mapper |
| `services/sessionPacks.ts::getMySessionBalanceApi` | `{ online: { total, used }, written: { total, used } }` | `{ online_sessions: number, written_sessions: number, ai_messages: number }` (مباشرة scalars) | إعادة كتابة |
| `services/aiPlans.ts::getMySubscriptionApi` | `plan_id`, `plan_name`, `renews_at` في الجذر | `{ subscribed, plan: {...}, messages_used, messages_limit, remaining, expires_at }` | إعادة كتابة |
| `services/notifications.ts` | يرسل `{ ids: [] }` | `POST /notifications/mark-as-read` يتجاهل الـ body ويصنف الكل كمقروء | فصل `markAsReadApi(id)` عن `markAllAsReadApi()` مع المسارات الصحيحة |

#### 🔌 خدمات وشاشات جديدة

| Commit | الـ Path | الوصف |
|--------|--------|-------|
| `c8bc91c` | `context/NotificationsContext.tsx` | أعيد كتابته — يجيب الإشعارات من `getNotificationsApi`، optimistic updates، يحذف 5 إشعارات hardcoded |
| `c8bc91c` | `app/auth/forgot-password.tsx` | شاشة جديدة تستدعي `forgotPasswordApi` |
| `c8bc91c` | `app/auth/login.tsx` | ربط زر "نسيت كلمة المرور؟" (كان بلا handler) |
| `d250457` | `app/_layout.tsx` | تسجيل 5 `Stack.Screen` جديدة (forgot-password, ai-plans, session-packs, courses/index, courses/[id]) |
| `8f57404` | `app/ai-plans/index.tsx` | شاشة جديدة: الخطط + الاشتراك + الإلغاء |
| `f12ce0b` | `app/session-packs/index.tsx` | شاشة جديدة: wallet bundles + balance + شراء |
| `227d678` | `app/courses/index.tsx` + `[id].tsx` | شاشتين جديدتين |
| `46d6b24` | `app/(tabs)/wallet.tsx` | إزالة `WALLET_PACKAGES` mock — الآن يجيب الباقات من `/session-packs?pack_type=wallet_bundle` ويستخدم `useCurrency` |
| `ef7f2f7` | `app/(tabs)/profile.tsx` | Currency picker modal (10 عملات) + روابط للشاشات الجديدة |
| `5d52c66` | `app/sessions/report/[id].tsx` | حذف `MOCK_SESSIONS` + `MOCK_REPORTS` — الآن يجيب الحجز من `getReservationsApi` ويعرض "التقرير قيد التجهيز" |
| `a01461d` | `services/notifications.ts` + `NotificationsContext.tsx` | إصلاح مسارات mark-as-read (كان `{ ids: [] }` يؤدي لـ mark-all-by-mistake) |

إجمالي التغيير: **7 ملف خدمة معدل + 8 شاشة جديدة/معدلة + 5 routes**.

### 2.b Frontend (`kaleem-wellbeing-hub`)

على نفس الفرع `claude/improve-mobile-app-nJrpj` — 4 commits تركّز على إزالة البيانات الوهمية + توحيد مصدر الباقات.

#### 🔔 Notifications

| Commit | الـ Path | الوصف |
|--------|--------|-------|
| `09757e1` | `src/pages/NotificationsPage.tsx` | استدعاء `/mark-all-as-read` كان يرد 404 لأن الباكند ما فيهوش. تم التحويل إلى `POST /notifications/mark-as-read` (نفس الـ endpoint اللي يصنّف الكل كمقروء لما الـ body فاضي — مطابق لسلوك الموبايل `markAllAsReadApi`). |
| `09757e1` | `src/data/notificationsData.ts` | `dummyNotifications` أُفرغت — كانت 5 كائنات hardcoded تظهر للمستخدم لو الـ API فشل. الآن الـ hook يرجّع مصفوفة فاضية والـ UI يعرض empty state بشكل صحيح. |

#### 💳 Wallet bundles — مصدر موحّد

| Commit | الـ Path | الوصف |
|--------|--------|-------|
| `11af39c` | `src/hooks/useWalletBundles.ts` (جديد) | Hook جديد على React Query: يجيب الباقات من `GET /session-packs?pack_type=wallet_bundle` ويحوّلها لشكل `WalletBundle` بنفس أسماء الحقول اللي الـ UI يستعملها (`writtenFree`, `aiMessages`, `aiLabel`, `extendedChat`, `popular`, `badge`). الـ color rotation (`emerald` → `blue` → `purple`) يُسند client-side حسب ترتيب الباقات. `staleTime: 5min`. |
| `9057782` | `src/components/dialogues/DepositModal.tsx` | استبدال `CREDIT_PACKS` المحلية بـ `useWalletBundles`. تم حذف ≈60 سطر ثابتة. أُضيف loading state (`Loader2` مع نص "جارٍ تحميل الباقات…") وحالة empty ("لا توجد باقات متاحة الآن"). الـ `pack_id` المرسل لـ `/wallet/paypal/create-order` الآن يستخدم `pack.dbId` (الـ row id الحقيقي) بدل الـ slug. |
| `c65b942` | `src/components/sections/PricingSection.tsx` | نفس refactor الـ DepositModal مُطبّق على الصفحة الرئيسية. `CreditPack` type بقى alias لـ `WalletBundle`. الـ animations، الـ ConfirmModal، الـ HowItWorksStrip، والـ cardVariants ما اتغيرواش. أُضيف loading + empty state بنفس النمط. الميزات الاختيارية (`writtenFree > 0`, `aiMessages > 0`, `extendedChat`) الآن تُخفى بشكل مشروط بدل ما تُعرض بأصفار. |

#### أثر جانبي مهم

بعد commit `11af39c`: أي surface جديد يحتاج يعرض wallet top-up options (مثل settings page، onboarding، referral bonus modal) يستورد `useWalletBundles` مباشرة — ممنوع دبلـ الـ hardcode تاني. الـ source of truth بقى في Laravel migration `session_packs` مع `pack_type='wallet_bundle'`.

إجمالي التغيير: **3 ملفات معدّلة + 1 hook جديد = ≈150 سطر مضاف، ≈180 سطر محذوف**.

---

## 3. Missing ❌

### 3.a Backend (`rafiq_backend`)

| الـ endpoint | الحالة | التفاصيل |
|--------------|--------|----------|
| `GET /reservations/{id}/report` | ❌ غير موجود | الموبايل في `sessions/report/[id].tsx` يعرض placeholder "التقرير قيد التجهيز". الموجود فقط `GET /reports/{report}/download` في نطاق المستشار — غير متاح للمستخدم العادي. |
| `DELETE /user` أو `/user/delete` | ❌ غير موجود | الموبايل عنده زر "حذف الحساب" في `profile.tsx` بدون endpoint في الباكند. |
| Notification preferences endpoint | ❌ غير موجود | `NotificationsTab.tsx` في الفرونت يحفظ إعدادات التنبيهات (البريد/الرسائل/App) في state محلي فقط — لا يوجد `POST /notifications/preferences` في الباكند. |
| Session packs consultant tiers | ❌ hardcoded في الاثنين | تفاصيل الباقات (4/6/10 جلسات، discounts %) مُشفّرة مباشرة في `SessionPackController::purchaseConsultantPack` وفي `SessionPacksSection.tsx` — لا endpoint لجلبها ديناميكياً. |

### 3.b Frontend (`kaleem-wellbeing-hub`)

| الميزة | الحالة | التفاصيل |
|--------|--------|----------|
| صفحة AI Plans | ❌ غير موجودة | `useKaleemSubscription` يقرأ فقط `/ai/conversations/remaining` — لا توجد صفحة كاملة تعرض الخطط أو تتيح الاشتراك/الإلغاء. الموبايل عنده `app/ai-plans/index.tsx` شاشة كاملة تغطي `GET /ai-plans`، `POST /ai-plans/subscribe`، `POST /ai-plans/cancel`. |
| `GET /reservations/{id}/join-token` | ❌ غير مستدعى | الـ endpoint موجود في الباكند ومستدعى في الموبايل عبر `getJoinTokenApi`، لكنه غائب عن الفرونت — زر "انضمام للجلسة" في `AppointmentsPage` لا يجلب token حقيقي. |
| `useNotifications` hook موحّد | ❌ منطق مكرر | منطق الـ fetch والـ mark-as-read مكرر في `NotificationsDropdown.tsx` و`NotificationsPage.tsx`. يجب توحيده في hook واحد `useNotifications` لتفادي divergence مستقبلاً. |

### 3.c Mobile (`kaleemmobileapp-final`)

| الميزة | الحالة | التفاصيل |
|--------|--------|------|
| شاشة تغيير كلمة المرور | ❌ شاشة مفقودة | `changePasswordApi` موجود في `services/auth.ts`، لكن لا شاشة. زر القفل في `profile.tsx` يوجّه لـ `forgot-password` بدلاً من شاشة تغيير كلمة المرور. |
| شاشة تعديل الملف الشخصي | ❌ handler مفقود | زر المستخدم في `profile.tsx` بلا `onPress` handler — لا توجد شاشة Edit Profile. |
| روابط الدعم | ❌ وهمية | Help Center / Contact Us / Privacy Policy / Terms of Service كلها `onPress={() => {}}` بدون navigation أو URL. |

| حذف الحساب | ❌ API مفقود | الزر موجود في `profile.tsx` لكن لا `DELETE /user` في الباكند (انظر 3.a). |
| PayPal / Apple Pay | ❌ UI وهمي | أزرار الدفع موجودة في `wallet.tsx` لكنها لا تستدعي أي API — تعرض "قريباً". |
| Pusher real-time notifications | ❌ غير مُطبّق | الفرونت يستخدم Pusher عبر `Echo`. الموبايل يعتمد على polling فقط (`NotificationsContext` يجلب عند mount). |

> القسم 4 يُكمل في التاسك التالية.
