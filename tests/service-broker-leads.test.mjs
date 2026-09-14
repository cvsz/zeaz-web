import assert from 'node:assert/strict';
import test from 'node:test';

import { CONSENT_POLICY_VERSION, createServiceBrokerLead, isServiceBrokerLead } from '../src/service-broker-leads.js';

test('creates normalized lead contract', () => {
  const lead = createServiceBrokerLead(
    {
      serviceId: 'automation',
      name: ' Example Buyer ',
      email: 'BUYER@EXAMPLE.COM',
      company: 'Example Co',
      message: 'Need a workflow automation quote',
      channel: 'google-ads',
      campaignId: 'cmp-001',
      privacyAccepted: true
    },
    {
      leadId: 'lead-001',
      occurredAt: '2026-09-12T14:00:00.000Z',
      landingPage: 'https://www.zeaz.dev/services/automation'
    }
  );

  assert.equal(lead.schemaVersion, 'service-broker.lead.v1');
  assert.equal(lead.customer.name, 'Example Buyer');
  assert.equal(lead.customer.email, 'buyer@example.com');
  assert.equal(lead.attribution.channel, 'google-ads');
  assert.equal(lead.consent.privacyAccepted, true);
  assert.equal(lead.consent.privacyPolicyVersion, CONSENT_POLICY_VERSION);
  assert.equal(lead.consent.acceptedAt, '2026-09-12T14:00:00.000Z');
  assert.equal(isServiceBrokerLead(lead), true);
});

test('rejects missing identity and service fields', () => {
  assert.throws(() => createServiceBrokerLead({ email: 'buyer@example.com', name: 'Buyer', privacyAccepted: true }), /serviceId/);
  assert.throws(() => createServiceBrokerLead({ serviceId: 'automation', email: 'bad', name: 'Buyer', privacyAccepted: true }), /email/);
});

test('requires explicit privacy consent at lead creation', () => {
  const base = { serviceId: 'automation', email: 'buyer@example.com', name: 'Buyer' };
  assert.throws(() => createServiceBrokerLead(base), /privacy consent/);
  assert.throws(() => createServiceBrokerLead({ ...base, privacyAccepted: false }), /privacy consent/);
  assert.throws(() => createServiceBrokerLead({ ...base, privacyAccepted: 'true' }), /privacy consent/);
});

test('records auditable consent evidence at the same event time', () => {
  const occurredAt = '2026-09-14T08:00:00.000Z';
  const lead = createServiceBrokerLead({
    serviceId: 'automation',
    email: 'buyer@example.com',
    name: 'Buyer',
    privacyAccepted: true,
    marketingAccepted: true
  }, { leadId: 'lead-consent-audit-001', occurredAt });

  assert.equal(lead.consent.privacyPolicyVersion, 'privacy-2026-09-14');
  assert.equal(lead.consent.acceptedAt, occurredAt);
  assert.equal(lead.consent.marketingAccepted, true);
});

test('rejects lead payloads without explicit privacy consent', () => {
  const lead = createServiceBrokerLead({
    serviceId: 'automation',
    email: 'buyer@example.com',
    name: 'Buyer',
    privacyAccepted: true
  }, { leadId: 'lead-consent-001', occurredAt: '2026-09-14T07:00:00.000Z' });

  assert.equal(isServiceBrokerLead(lead), true);
  assert.equal(isServiceBrokerLead({ ...lead, consent: { privacyAccepted: false, marketingAccepted: false } }), false);
  assert.equal(isServiceBrokerLead({ ...lead, consent: undefined }), false);
});
