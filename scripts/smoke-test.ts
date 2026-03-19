import { NextRequest } from 'next/server';

async function run() {
  console.log('Running smoke test...');

  // Import handlers
  const { GET: getConnections } = await import('../src/app/api/connections/route');
  const { GET: getProfiles } = await import('../src/app/api/profiles/route');
  const { GET: getTemplates } = await import('../src/app/api/templates/route');
  const { GET: getSavedQueries } = await import('../src/app/api/saved-queries/route');
  const { GET: getPresets } = await import('../src/app/api/presets/route');

  const baseReq = new NextRequest('http://localhost');

  const connRes = await getConnections();
  console.log('connections:', (await connRes.json()).length);

  const profRes = await getProfiles();
  console.log('profiles:', (await profRes.json()).length);

  const templRes = await getTemplates();
  console.log('templates:', (await templRes.json()).length);

  const savedRes = await getSavedQueries();
  console.log('savedQueries:', (await savedRes.json()).length);

  const presetsRes = await getPresets();
  console.log('presets:', (await presetsRes.json()).length);

  // Verify a param-based handler can run
  const { PUT: updateConnection } = await import('../src/app/api/connections/[id]/route');
  const updateReq = new NextRequest('http://localhost', {
    method: 'PUT',
    body: JSON.stringify({ name: 'Production_v1_updated' }),
    headers: { 'Content-Type': 'application/json' }
  });
  const updateRes = await updateConnection();
  console.log('updateConnection status', updateRes.status);

  const { POST: testConnection } = await import('../src/app/api/connections/[id]/test/route');
  const testRes = await testConnection();
  console.log('testConnection status', testRes.status);

  console.log('Smoke test complete.');
}

run().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
