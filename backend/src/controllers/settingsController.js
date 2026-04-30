import { query } from '../config/database.js'

const DELIVERY_KEYS = ['free_delivery_threshold', 'delivery_fee_standard', 'delivery_fee_express']

export async function getDeliverySettings(req, res) {
  try {
    const { rows } = await query(
      `SELECT key, value FROM store_settings WHERE key = ANY($1)`,
      [DELIVERY_KEYS]
    )
    const settings = {}
    for (const r of rows) settings[r.key] = parseFloat(r.value)
    // Fill defaults if any missing
    if (!settings.free_delivery_threshold) settings.free_delivery_threshold = 500
    if (!settings.delivery_fee_standard)   settings.delivery_fee_standard   = 30
    if (!settings.delivery_fee_express)    settings.delivery_fee_express     = 60
    res.json(settings)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function updateDeliverySettings(req, res) {
  try {
    const { free_delivery_threshold, delivery_fee_standard, delivery_fee_express } = req.body
    const updates = [
      ['free_delivery_threshold', free_delivery_threshold],
      ['delivery_fee_standard',   delivery_fee_standard],
      ['delivery_fee_express',    delivery_fee_express],
    ].filter(([, v]) => v !== undefined && v !== null && !isNaN(Number(v)))

    for (const [key, value] of updates) {
      await query(
        `INSERT INTO store_settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(Number(value))]
      )
    }
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
}
