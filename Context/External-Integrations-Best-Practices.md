# 🔌 EXTERNAL INTEGRATIONS BEST PRACTICES - PODENZA
## 2024-2025 Security Standards & Implementation Guidelines

### Information General
This document provides comprehensive best practices for external integrations in the PODENZA architecture, aligned with the Vercel + Supabase stack and the security requirements established in the project. All recommendations are based on the latest 2024-2025 industry standards and compliance requirements.

---

## 🟢 1. WHATSAPP BUSINESS API INTEGRATION

### **Authentication & Security**

#### **Webhook Authentication (2024 Standards)**
```typescript
// ✅ BEST PRACTICE - HMAC signature validation
import crypto from 'crypto';

const verifyWhatsAppWebhook = (payload: string, signature: string): boolean => {
  const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET!;

  // Remove 'sha256=' prefix if present
  const cleanSignature = signature.replace('sha256=', '');

  // Create HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload, 'utf8')
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cleanSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

// API Route implementation
export async function POST(request: Request) {
  const signature = request.headers.get('x-hub-signature-256');
  const payload = await request.text();

  if (!signature || !verifyWhatsAppWebhook(payload, signature)) {
    console.warn('Invalid WhatsApp webhook signature');
    return new Response('Unauthorized', { status: 401 });
  }

  // Process webhook...
}
```

#### **Rate Limiting & Performance (2024 Guidelines)**
```typescript
// ✅ BEST PRACTICE - WhatsApp rate limiting compliance
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const whatsappRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(250, '24 h'), // WhatsApp business limit
  analytics: true,
});

const sendWhatsAppMessage = async (phoneNumber: string, message: any) => {
  // Check rate limit (250 business-initiated chats per 24h)
  const identifier = `whatsapp:${phoneNumber}`;
  const { success, limit, remaining } = await whatsappRateLimit.limit(identifier);

  if (!success) {
    throw new Error('WhatsApp rate limit exceeded');
  }

  // API call rate limiting (300 calls/minute for growth plans)
  const response = await fetch('https://graph.facebook.com/v18.0/PHONE_NUMBER_ID/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phoneNumber,
      ...message
    })
  });

  return response.json();
};
```

#### **Message Template Best Practices**
```typescript
// ✅ BEST PRACTICE - Template management and validation
const WhatsAppTemplates = {
  SOLICITUD_APROBADA: {
    name: 'solicitud_aprobada',
    language: 'es',
    components: [
      {
        type: 'header',
        parameters: [{ type: 'text', text: 'PODENZA' }]
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{nombre_cliente}}' },
          { type: 'text', text: '{{monto_aprobado}}' }
        ]
      }
    ]
  }
};

const sendTemplateMessage = async (phoneNumber: string, templateKey: keyof typeof WhatsAppTemplates, params: Record<string, string>) => {
  const template = WhatsAppTemplates[templateKey];

  // Validate template parameters
  const requiredParams = template.components
    .flatMap(comp => comp.parameters || [])
    .filter(param => param.text?.includes('{{'))
    .map(param => param.text?.match(/{{(\w+)}}/)?.[1])
    .filter(Boolean);

  for (const param of requiredParams) {
    if (!params[param!]) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }

  return await sendWhatsAppMessage(phoneNumber, {
    type: 'template',
    template: {
      name: template.name,
      language: { code: template.language },
      components: template.components.map(comp => ({
        ...comp,
        parameters: comp.parameters?.map(param => ({
          ...param,
          text: param.text?.replace(/{{(\w+)}}/g, (_, key) => params[key] || '')
        }))
      }))
    }
  });
};
```

#### **GDPR Compliance & Consent**
```typescript
// ✅ BEST PRACTICE - GDPR compliant WhatsApp integration
const WhatsAppConsentManager = {
  async verifyConsent(userId: string, phoneNumber: string): Promise<boolean> {
    const { data: consent } = await supabase
      .from('whatsapp_consents')
      .select('*')
      .eq('user_id', userId)
      .eq('phone_number', phoneNumber)
      .eq('status', 'active')
      .single();

    return !!consent && new Date(consent.expires_at) > new Date();
  },

  async recordConsent(userId: string, phoneNumber: string, consentType: 'marketing' | 'transactional') {
    await supabase
      .from('whatsapp_consents')
      .insert({
        user_id: userId,
        phone_number: phoneNumber,
        consent_type: consentType,
        granted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        status: 'active'
      });
  },

  async revokeConsent(userId: string, phoneNumber: string) {
    await supabase
      .from('whatsapp_consents')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('phone_number', phoneNumber);
  }
};
```

---

## 🏦 2. BANKING APIS INTEGRATION (Bancolombia, Davivienda, BBVA)

### **mTLS Implementation & Security**

#### **Mutual TLS Configuration**
```typescript
// ✅ BEST PRACTICE - mTLS for banking APIs
import https from 'https';
import fs from 'fs';

class BankingAPIClient {
  private readonly certPath: string;
  private readonly keyPath: string;
  private readonly caPath: string;

  constructor(bankConfig: {
    certPath: string;
    keyPath: string;
    caPath: string;
    baseURL: string;
  }) {
    this.certPath = bankConfig.certPath;
    this.keyPath = bankConfig.keyPath;
    this.caPath = bankConfig.caPath;
  }

  private createSecureAgent() {
    return new https.Agent({
      cert: fs.readFileSync(this.certPath),
      key: fs.readFileSync(this.keyPath),
      ca: fs.readFileSync(this.caPath),
      rejectUnauthorized: true,
      checkServerIdentity: (host, cert) => {
        // Additional certificate validation
        return undefined; // No error means validation passed
      }
    });
  }

  async makeSecureRequest(endpoint: string, data: any, retryConfig = { maxRetries: 3, backoffMs: 1000 }) {
    const requestId = crypto.randomUUID();
    let lastError;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        // Encrypt sensitive data before transmission
        const encryptedData = await this.encryptSensitiveFields(data);

        const response = await fetch(endpoint, {
          method: 'POST',
          agent: this.createSecureAgent(),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await this.getBankingToken()}`,
            'X-Request-ID': requestId,
            'X-Timestamp': Date.now().toString(),
            'X-Client-Version': '1.0.0'
          },
          body: JSON.stringify(encryptedData),
          timeout: 30000 // 30 second timeout
        });

        // Log transaction for audit
        await this.auditLog({
          request_id: requestId,
          endpoint,
          status_code: response.status,
          attempt,
          timestamp: new Date().toISOString()
        });

        if (!response.ok) {
          throw new Error(`Banking API error: ${response.status}`);
        }

        return await response.json();

      } catch (error) {
        lastError = error;
        if (attempt < retryConfig.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryConfig.backoffMs * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError;
  }

  private async encryptSensitiveFields(data: any): Promise<any> {
    // Encrypt account numbers, document numbers, etc.
    const sensitiveFields = ['accountNumber', 'documentNumber', 'amount'];
    const encrypted = { ...data };

    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        encrypted[field] = await this.encryptField(encrypted[field]);
      }
    }

    return encrypted;
  }
}
```

#### **PCI DSS Compliance Implementation**
```typescript
// ✅ BEST PRACTICE - PCI DSS 4.0.1 compliant banking integration
const PCICompliantBanking = {
  async processPayment(paymentData: {
    amount: number;
    currency: string;
    accountNumber: string;
    documentNumber: string;
  }) {
    // 1. Validate all inputs according to PCI DSS
    const sanitizedData = this.sanitizePaymentData(paymentData);

    // 2. Encrypt cardholder data before processing
    const encryptedData = await this.encryptCardholderData(sanitizedData);

    // 3. Use strong cryptography for transmission (TLS 1.3+)
    const response = await this.sendSecurePaymentRequest(encryptedData);

    // 4. Log transaction without sensitive data
    await this.logPaymentTransaction({
      transaction_id: response.transactionId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: response.status,
      // Never log full account numbers or card data
      account_masked: this.maskAccountNumber(paymentData.accountNumber),
      timestamp: new Date().toISOString()
    });

    return response;
  },

  sanitizePaymentData(data: any) {
    // Remove any potentially malicious characters
    return {
      amount: Number(data.amount),
      currency: String(data.currency).replace(/[^A-Z]/g, '').substring(0, 3),
      accountNumber: String(data.accountNumber).replace(/[^\d]/g, ''),
      documentNumber: String(data.documentNumber).replace(/[^\d]/g, '')
    };
  },

  maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) return accountNumber;
    return `****${accountNumber.slice(-4)}`;
  }
};
```

#### **Error Handling & Circuit Breaker**
```typescript
// ✅ BEST PRACTICE - Resilient banking API integration
class BankingCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

---

## 📊 3. AUCO (CREDIT BUREAU) INTEGRATION

### **User Consent Management (Colombian Law Compliance)**

#### **Law 1581/2012 Compliant Consent**
```typescript
// ✅ BEST PRACTICE - Colombian data protection compliant consent
const AUCOConsentManager = {
  async requestConsent(userId: string, consentData: {
    documentNumber: string;
    purpose: string;
    dataTypes: string[];
    retentionPeriod: number; // days
  }) {
    const consentId = crypto.randomUUID();

    // Store consent request with all required information per Law 1581
    await supabase.from('auco_consent_requests').insert({
      consent_id: consentId,
      user_id: userId,
      document_number: consentData.documentNumber,
      purpose: consentData.purpose,
      data_types: consentData.dataTypes,
      retention_period_days: consentData.retentionPeriod,
      requested_at: new Date().toISOString(),
      status: 'pending',
      // Required by Colombian law: clear identification of data controller
      data_controller: 'PODENZA SAS',
      data_controller_contact: 'privacidad@podenza.co',
      // Legal basis under Law 1581
      legal_basis: 'explicit_consent',
      // User rights information
      user_rights: [
        'access',
        'rectification',
        'cancellation',
        'opposition'
      ]
    });

    return consentId;
  },

  async verifyValidConsent(userId: string, documentNumber: string): Promise<boolean> {
    const { data: consent } = await supabase
      .from('auco_consents')
      .select('*')
      .eq('user_id', userId)
      .eq('document_number', documentNumber)
      .eq('status', 'granted')
      .gte('expires_at', new Date().toISOString())
      .single();

    return !!consent;
  },

  async recordExplicitConsent(userId: string, consentId: string, consentMethod: 'digital_signature' | 'checkbox' | 'verbal') {
    await supabase.from('auco_consents').insert({
      consent_id: consentId,
      user_id: userId,
      granted_at: new Date().toISOString(),
      consent_method: consentMethod,
      ip_address: this.getClientIP(),
      user_agent: this.getUserAgent(),
      // Colombian law requirement: consent must be free, specific, informed, and unambiguous
      consent_type: 'explicit',
      revocable: true,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'granted'
    });
  }
};
```

#### **Data Minimization & Audit Logging**
```typescript
// ✅ BEST PRACTICE - Data minimization and comprehensive audit trail
const AUCOSecureClient = {
  async consultCreditBureau(userId: string, documentNumber: string, consultationType: 'basic' | 'detailed') {
    // 1. Verify consent exists and is valid
    const hasValidConsent = await AUCOConsentManager.verifyValidConsent(userId, documentNumber);
    if (!hasValidConsent) {
      throw new Error('Valid consent required for credit bureau consultation');
    }

    // 2. Log consultation attempt for audit
    const consultationId = crypto.randomUUID();
    await this.auditLog({
      consultation_id: consultationId,
      user_id: userId,
      document_number_hash: crypto.createHash('sha256').update(documentNumber).digest('hex'),
      consultation_type: consultationType,
      initiated_at: new Date().toISOString(),
      legal_basis: 'user_consent',
      purpose: 'credit_risk_assessment'
    });

    // 3. Request only necessary data (data minimization principle)
    const requestData = {
      document_number: documentNumber,
      consultation_type: consultationType,
      requested_fields: this.getMinimalFieldsForType(consultationType),
      purpose: 'credit_assessment',
      retention_period_days: 30 // Minimum necessary
    };

    try {
      // 4. Encrypt document number in transit
      const encryptedRequest = await this.encryptSensitiveData(requestData);

      const response = await fetch(process.env.AUCO_API_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAUCOToken()}`,
          'Content-Type': 'application/json',
          'X-Consultation-ID': consultationId,
          'X-Client-ID': process.env.AUCO_CLIENT_ID!
        },
        body: JSON.stringify(encryptedRequest),
        timeout: 15000 // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`AUCO API error: ${response.status}`);
      }

      const result = await response.json();

      // 5. Log successful consultation
      await this.auditLog({
        consultation_id: consultationId,
        status: 'success',
        response_received_at: new Date().toISOString(),
        data_classification: 'sensitive_personal_data'
      });

      // 6. Schedule automatic data deletion according to retention policy
      await this.scheduleDataDeletion(consultationId, 30); // Delete after 30 days

      return result;

    } catch (error) {
      // Log failed consultation
      await this.auditLog({
        consultation_id: consultationId,
        status: 'failed',
        error_message: error.message,
        failed_at: new Date().toISOString()
      });
      throw error;
    }
  },

  getMinimalFieldsForType(type: 'basic' | 'detailed'): string[] {
    switch (type) {
      case 'basic':
        return ['credit_score', 'risk_level', 'has_defaults'];
      case 'detailed':
        return ['credit_score', 'risk_level', 'has_defaults', 'credit_history_months', 'total_debt'];
      default:
        return ['credit_score'];
    }
  },

  async scheduleDataDeletion(consultationId: string, retentionDays: number) {
    await supabase.from('data_deletion_schedule').insert({
      consultation_id: consultationId,
      delete_at: new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString(),
      data_type: 'credit_bureau_response',
      status: 'scheduled'
    });
  }
};
```

---

## 📧 4. SENDGRID/EMAIL SERVICE INTEGRATION

### **Email Deliverability Best Practices (2024)**

#### **Authentication & Reputation Management**
```typescript
// ✅ BEST PRACTICE - Complete email authentication setup
const EmailAuthConfig = {
  // SPF Record (DNS)
  spf: 'v=spf1 include:sendgrid.net ~all',

  // DKIM setup through SendGrid
  setupDKIM: async () => {
    // Configure in SendGrid dashboard:
    // 1. Navigate to Settings > Sender Authentication
    // 2. Domain Authentication > Authenticate Your Domain
    // 3. Add DNS records provided by SendGrid
  },

  // DMARC Record (DNS)
  dmarc: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@podenza.co',

  // BIMI Record for logo display (2024 trend)
  bimi: 'v=BIMI1; l=https://podenza.co/logo.svg; a=https://podenza.co/bimi-cert.pem'
};

class EmailDeliverabilityManager {
  async sendTransactionalEmail(emailData: {
    to: string;
    templateId: string;
    dynamicTemplateData: Record<string, any>;
    categories?: string[];
  }) {
    // 1. Validate recipient and check suppression list
    const isValidRecipient = await this.validateRecipient(emailData.to);
    if (!isValidRecipient) {
      throw new Error('Invalid recipient or suppressed email');
    }

    // 2. Configure email for optimal deliverability
    const email = {
      to: emailData.to,
      from: {
        email: 'noreply@podenza.co',
        name: 'PODENZA'
      },
      template_id: emailData.templateId,
      dynamic_template_data: emailData.dynamicTemplateData,
      categories: emailData.categories || ['transactional'],
      // Critical for deliverability
      asm: {
        group_id: 12345, // Unsubscribe group
        groups_to_display: [12345]
      },
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking: { enable: true },
        subscription_tracking: { enable: false } // Transactional emails
      },
      mail_settings: {
        bypass_list_management: { enable: true }, // For transactional
        footer: { enable: false }
      }
    };

    return await this.sendEmail(email);
  }

  async validateRecipient(email: string): Promise<boolean> {
    // Check against suppression lists
    const suppressionCheck = await this.checkSuppressionList(email);
    if (suppressionCheck.suppressed) {
      return false;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

#### **GDPR Compliance & List Management**
```typescript
// ✅ BEST PRACTICE - GDPR compliant email management
const EmailGDPRManager = {
  async recordEmailConsent(emailData: {
    email: string;
    userId: string;
    consentType: 'marketing' | 'transactional' | 'both';
    source: string;
    ipAddress: string;
    userAgent: string;
  }) {
    // Store consent with all GDPR required information
    await supabase.from('email_consents').insert({
      email: emailData.email,
      user_id: emailData.userId,
      consent_type: emailData.consentType,
      consent_source: emailData.source,
      granted_at: new Date().toISOString(),
      ip_address: emailData.ipAddress,
      user_agent: emailData.userAgent,
      // GDPR Article 7 - Proof of consent
      consent_method: 'opt_in',
      // Double opt-in for marketing emails
      confirmed: emailData.consentType === 'transactional',
      status: 'active'
    });

    // Send confirmation email for marketing consent
    if (emailData.consentType === 'marketing' || emailData.consentType === 'both') {
      await this.sendDoubleOptInEmail(emailData.email, emailData.userId);
    }
  },

  async sendDoubleOptInEmail(email: string, userId: string) {
    const confirmationToken = crypto.randomUUID();

    // Store confirmation token
    await supabase.from('email_confirmations').insert({
      user_id: userId,
      email,
      confirmation_token: confirmationToken,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      confirmed: false
    });

    // Send confirmation email
    await this.sendEmail({
      to: email,
      template_id: 'd-confirmation-template-id',
      dynamic_template_data: {
        confirmation_url: `${process.env.NEXT_PUBLIC_SITE_URL}/email/confirm?token=${confirmationToken}`,
        company_name: 'PODENZA'
      }
    });
  },

  async handleUnsubscribe(email: string, type: 'marketing' | 'all') {
    await supabase
      .from('email_consents')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
        unsubscribe_type: type
      })
      .eq('email', email);

    // Add to SendGrid suppression list
    await this.addToSuppressionList(email, type);
  }
};
```

#### **Bounce & Complaint Handling**
```typescript
// ✅ BEST PRACTICE - Automated bounce and complaint handling
export async function POST(request: Request) {
  const events = await request.json();

  for (const event of events) {
    switch (event.event) {
      case 'bounce':
        await handleBounce(event);
        break;
      case 'dropped':
        await handleDrop(event);
        break;
      case 'spamreport':
        await handleSpamComplaint(event);
        break;
      case 'unsubscribe':
        await handleUnsubscribe(event);
        break;
    }
  }

  return new Response('OK');
}

async function handleBounce(event: any) {
  const bounceType = event.type === 'bounce' ? 'hard' : 'soft';

  // Log bounce
  await supabase.from('email_bounces').insert({
    email: event.email,
    bounce_type: bounceType,
    reason: event.reason,
    bounced_at: new Date(event.timestamp * 1000).toISOString(),
    message_id: event.sg_message_id
  });

  // For hard bounces, suppress immediately
  if (bounceType === 'hard') {
    await supabase
      .from('email_consents')
      .update({
        status: 'bounced',
        bounced_at: new Date().toISOString()
      })
      .eq('email', event.email);
  }
}

async function handleSpamComplaint(event: any) {
  // Immediately suppress email
  await supabase
    .from('email_consents')
    .update({
      status: 'spam_complaint',
      complaint_at: new Date().toISOString()
    })
    .eq('email', event.email);

  // Log for investigation
  await supabase.from('spam_complaints').insert({
    email: event.email,
    complained_at: new Date(event.timestamp * 1000).toISOString(),
    message_id: event.sg_message_id,
    category: event.category
  });
}
```

---

## 🤖 5. AI SERVICES INTEGRATION (OpenAI, Claude)

### **Data Privacy & Security**

#### **Data Sanitization & PII Removal**
```typescript
// ✅ BEST PRACTICE - Secure AI processing with PII protection
class AISecurityManager {
  private readonly piiPatterns = {
    cedula: /\b\d{8,11}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(?:\+57|57)?\s*[1-9]\d{8,9}\b/g,
    accountNumber: /\b\d{10,20}\b/g,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g
  };

  sanitizeForAI(text: string): { sanitized: string; redactionMap: Map<string, string> } {
    let sanitized = text;
    const redactionMap = new Map<string, string>();

    // Redact PII with placeholder tokens
    Object.entries(this.piiPatterns).forEach(([type, pattern]) => {
      sanitized = sanitized.replace(pattern, (match) => {
        const token = `[${type.toUpperCase()}_${crypto.randomBytes(4).toString('hex')}]`;
        redactionMap.set(token, match);
        return token;
      });
    });

    return { sanitized, redactionMap };
  }

  async processDocumentWithAI(documentText: string, userId: string, purpose: 'analysis' | 'extraction' | 'classification') {
    // 1. Sanitize document
    const { sanitized, redactionMap } = this.sanitizeForAI(documentText);

    // 2. Log AI usage for audit
    const processingId = crypto.randomUUID();
    await this.logAIUsage({
      processing_id: processingId,
      user_id: userId,
      purpose,
      data_hash: crypto.createHash('sha256').update(documentText).digest('hex'),
      ai_provider: 'openai',
      pii_removed: redactionMap.size > 0,
      timestamp: new Date().toISOString()
    });

    // 3. Process with AI
    const result = await this.callAIService(sanitized, purpose);

    // 4. Clean up - don't store AI responses with PII
    return {
      result,
      processing_id: processingId,
      // Never return the original text or redaction map
    };
  }

  private async callAIService(sanitizedText: string, purpose: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective for document processing
      messages: [
        {
          role: "system",
          content: `You are analyzing financial documents. Never attempt to guess or reconstruct redacted information marked with brackets like [CEDULA_abc123]. Focus on ${purpose}.`
        },
        {
          role: "user",
          content: sanitizedText
        }
      ],
      max_tokens: 1000,
      temperature: 0.1, // Deterministic for consistency
      // Cost optimization
      presence_penalty: 0,
      frequency_penalty: 0
    });

    return response.choices[0]?.message?.content;
  }
}
```

#### **Cost Optimization Strategies**
```typescript
// ✅ BEST PRACTICE - AI cost optimization for 2024
class AICostOptimizer {
  private readonly modelCosts = {
    'gpt-4o-mini': { input: 0.150, output: 0.600 }, // per 1M tokens
    'gpt-4o': { input: 2.50, output: 10.00 },
    'claude-3-sonnet': { input: 3.00, output: 15.00 },
    'claude-3-haiku': { input: 0.25, output: 1.25 }
  };

  async selectOptimalModel(task: 'simple_analysis' | 'complex_reasoning' | 'document_extraction', textLength: number) {
    const estimatedTokens = Math.ceil(textLength / 4); // Rough token estimation

    // Model selection based on task complexity and cost
    switch (task) {
      case 'simple_analysis':
        return estimatedTokens > 10000 ? 'claude-3-haiku' : 'gpt-4o-mini';
      case 'complex_reasoning':
        return 'claude-3-sonnet';
      case 'document_extraction':
        return 'gpt-4o-mini';
      default:
        return 'gpt-4o-mini';
    }
  }

  async batchProcessDocuments(documents: string[], processingType: string) {
    // Batch similar documents to reduce API calls
    const batches = this.createOptimalBatches(documents);
    const results = [];

    for (const batch of batches) {
      const batchText = batch.join('\n---DOCUMENT_SEPARATOR---\n');
      const result = await this.processWithRetry(batchText, processingType);
      results.push(...this.splitBatchResult(result));
    }

    return results;
  }

  private createOptimalBatches(documents: string[], maxBatchSize = 50000) {
    const batches = [];
    let currentBatch = [];
    let currentSize = 0;

    for (const doc of documents) {
      if (currentSize + doc.length > maxBatchSize && currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [doc];
        currentSize = doc.length;
      } else {
        currentBatch.push(doc);
        currentSize += doc.length;
      }
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  async processWithRetry(text: string, purpose: string, maxRetries = 3) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.callAIService(text, purpose);
      } catch (error) {
        lastError = error;

        // Exponential backoff for rate limiting
        if (error.message.includes('rate_limit')) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        } else {
          throw error;
        }
      }
    }

    throw lastError;
  }
}
```

#### **Response Validation & Safety**
```typescript
// ✅ BEST PRACTICE - AI response validation and safety
class AIResponseValidator {
  private readonly safeguards = {
    maxResponseLength: 5000,
    forbiddenPatterns: [
      /\b\d{8,11}\b/, // Potential cedulas
      /\b\d{16}\b/,   // Potential credit cards
      /password|contraseña/i,
      /token|key|secret/i
    ],
    requiredSafety: [
      'No personal information disclosed',
      'Professional financial analysis',
      'Compliant with data protection'
    ]
  };

  async validateAIResponse(response: string, context: {
    userId: string;
    processingType: string;
    originalDataContainedPII: boolean;
  }): Promise<{ isValid: boolean; safeResponse: string; issues: string[] }> {
    const issues: string[] = [];

    // 1. Check response length
    if (response.length > this.safeguards.maxResponseLength) {
      issues.push('Response too long');
    }

    // 2. Check for leaked PII
    for (const pattern of this.safeguards.forbiddenPatterns) {
      if (pattern.test(response)) {
        issues.push('Potential PII detected in response');
      }
    }

    // 3. Validate response structure
    if (!this.hasValidStructure(response, context.processingType)) {
      issues.push('Invalid response structure');
    }

    // 4. Safety check - ensure no sensitive information reconstruction
    if (context.originalDataContainedPII && this.containsPotentialPII(response)) {
      issues.push('Possible PII reconstruction detected');
    }

    const isValid = issues.length === 0;
    const safeResponse = isValid ? response : this.createSafeErrorResponse();

    // Log validation results
    await this.logResponseValidation({
      user_id: context.userId,
      processing_type: context.processingType,
      is_valid: isValid,
      issues,
      timestamp: new Date().toISOString()
    });

    return { isValid, safeResponse, issues };
  }

  private hasValidStructure(response: string, type: string): boolean {
    switch (type) {
      case 'document_analysis':
        return response.includes('analysis') || response.includes('assessment');
      case 'risk_evaluation':
        return /risk|score|rating/i.test(response);
      default:
        return response.length > 10;
    }
  }

  private containsPotentialPII(response: string): boolean {
    // Check for patterns that might indicate PII reconstruction
    const suspiciousPatterns = [
      /cedula.*\d{4,}/i,
      /document.*number.*\d{4,}/i,
      /account.*\d{4,}/i,
      /phone.*\d{4,}/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(response));
  }

  private createSafeErrorResponse(): string {
    return "Analysis completed with safety restrictions. Please contact support if you need additional information.";
  }
}
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### **Pre-Production Security Checklist**
- [ ] All webhook signatures implemented and tested
- [ ] Rate limiting configured for all external APIs
- [ ] mTLS certificates configured for banking APIs
- [ ] PCI DSS compliance validated for payment processing
- [ ] GDPR consent flows implemented and tested
- [ ] Colombian data protection (Law 1581) compliance verified
- [ ] Email authentication (SPF, DKIM, DMARC, BIMI) configured
- [ ] AI data sanitization and PII removal tested
- [ ] Error handling and circuit breakers implemented
- [ ] Audit logging configured for all integrations
- [ ] Cost monitoring and alerting set up for AI services
- [ ] Backup and disaster recovery procedures documented

### **Monitoring & Maintenance**
- [ ] Integration health checks automated
- [ ] Security vulnerability scanning scheduled
- [ ] Dependency updates automated
- [ ] Performance monitoring dashboards created
- [ ] Incident response procedures documented
- [ ] Regular security audits scheduled
- [ ] Compliance reporting automated
- [ ] Cost optimization reviews scheduled

### **Documentation Requirements**
- [ ] API integration guides updated
- [ ] Security procedures documented
- [ ] Compliance checklists maintained
- [ ] Incident response playbooks current
- [ ] Developer onboarding materials updated
- [ ] User consent management procedures documented

---

This document should be reviewed and updated **quarterly** to maintain alignment with evolving security standards, regulatory requirements, and best practices for external integrations in the PODENZA platform.