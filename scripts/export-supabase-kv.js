/*
  Export all KV rows from Supabase into .data/kv_export.json
  Uses env: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
*/

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

const OUT = path.resolve('.data/kv_export.json');

async function main() {
  const pageSize = 1000;
  let from = 0;
  let all = [];

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('kv_store_0ba58e95')
      .select('key,value')
      .range(from, to);

    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  fs.writeFileSync(OUT, JSON.stringify(all, null, 2));
  console.log(`Exported ${all.length} rows to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
