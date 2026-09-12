import assert from 'node:assert/strict';
import test from 'node:test';

import { createServiceBrokerLead, isServiceBrokerLead } from '../src/service-broker-leads.js';

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
  assert.equal(isServiceBrokerLead(lead), true);
});

test('rejects missing identity and service fields', () => {
  assert.throws(() => createServiceBrokerLead({ email: 'buyer@example.com', name: 'Buyer' }), /serviceId/);
  assert.throws(() => createServiceBrokerLead({ serviceId: 'automation', email: 'bad', name: 'Buyer' }), /email/);
});
