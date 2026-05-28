-- WhatsApp system: templates and sent logs.
-- Timestamps are INTEGER milliseconds (Date.now()), matching previous migrations.

CREATE TABLE wa_templates (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL, -- 'invoice_overdue' | 'invoice_reminder' | 'offer_expired' | 'custom'
  body       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE wa_messages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id   INTEGER REFERENCES wa_templates(id),
  customer_id   INTEGER REFERENCES customers(id),
  phone         TEXT NOT NULL,
  body          TEXT NOT NULL,
  ref_type      TEXT, -- 'invoice' | 'proposal' | null
  ref_id        INTEGER,
  status        TEXT NOT NULL DEFAULT 'sent', -- always 'sent' for wa.me redirect
  sent_at       INTEGER NOT NULL
);

CREATE INDEX idx_wa_messages_customer ON wa_messages(customer_id);
CREATE INDEX idx_wa_messages_ref ON wa_messages(ref_type, ref_id);

-- Seed initial templates
INSERT INTO wa_templates (name, type, body, created_at, updated_at)
VALUES 
('تذكير فاتورة متأخرة', 'invoice_overdue', 'مرحباً {customer_name}، نود تذكيرك بأن الفاتورة رقم {invoice_number} بمبلغ {amount} ر.س مستحقة بتاريخ {due_date} ولم يتم سدادها بعد. يمكنك الاطلاع على الفاتورة والدفع من الرابط التالي: {link}', 0, 0),
('تذكير فاتورة مستحقة قريباً', 'invoice_reminder', 'مرحباً {customer_name}، نود تذكيرك بأن الفاتورة رقم {invoice_number} بمبلغ {amount} ر.س ستكون مستحقة بتاريخ {due_date}. يمكنك الاطلاع على الفاتورة من الرابط التالي: {link}', 0, 0),
('إرسال عرض سعر جديد', 'offer_new', 'مرحباً {customer_name}، تم إعداد عرض السعر الجديد "{offer_title}". يمكنك مراجعته وقبوله عبر الرابط التالي: {link} وعبر كلمة المرور المخصصة لك.', 0, 0),
('تذكير عرض سعر منتهي', 'offer_expired', 'مرحباً {customer_name}، نود إعلامك بأن عرض السعر المقدم "{offer_title}" قد انتهت صلاحيته. إذا كنت ترغب بتجديده أو مناقشته، يسعدنا تواصلك معي.', 0, 0);
