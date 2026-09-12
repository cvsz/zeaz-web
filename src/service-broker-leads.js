const SCHEMA_VERSION = 'service-broker.lead.v1';

function clean(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

export function createServiceBrokerLead(input = {}, context = {}) {
  const serviceId = clean(input.serviceId, 100);
  const name = clean(input.name, 160);
  const email = clean(input.email, 254).toLowerCase();
  const company = clean(input.company, 200);
  const message = clean(input.message, 4000);

  if (!serviceId) throw new TypeError('serviceId is required');
  if (!name) throw new TypeError('name is required');
  if (!email || !email.includes('@')) throw new TypeError('valid email is required');

  return {
    schemaVersion: SCHEMA_VERSION,
    leadId: clean(context.leadId || crypto.randomUUID(), 100),
    occurredAt: context.occurredAt || new Date().toISOString(),
    source: 'zeaz-web',
    serviceId,
    customer: { name, email, company },
    enquiry: { message },
    attribution: {
      channel: clean(input.channel || context.channel || 'direct', 100),
      campaignId: clean(input.campaignId || context.campaignId || '', 160),
      landingPage: clean(input.landingPage || context.landingPage || '', 500),
      referrer: clean(input.referrer || context.referrer || '', 500),
      utmSource: clean(input.utmSource || '', 160),
      utmMedium: clean(input.utmMedium || '', 160),
      utmCampaign: clean(input.utmCampaign || '', 160)
    },
    consent: {
      privacyAccepted: input.privacyAccepted === true,
      marketingAccepted: input.marketingAccepted === true
    }
  };
}

export function isServiceBrokerLead(payload) {
  return Boolean(
    payload &&
    payload.schemaVersion === SCHEMA_VERSION &&
    payload.leadId &&
    payload.serviceId &&
    payload.customer?.name &&
    payload.customer?.email
  );
}

export { SCHEMA_VERSION };
