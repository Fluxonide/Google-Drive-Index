// Sample JavaScript file for local dev testing of CodePreview
const API_BASE = 'https://api.example.com/v2'

/**
 * Fetches user data from the API.
 * @param {string} userId - The unique user identifier
 * @returns {Promise<Object>} The user data object
 */
async function fetchUser(userId) {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

// Configuration object with nested properties
const config = {
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp_dev',
    pool: { min: 2, max: 10 },
  },
  cache: {
    ttl: 3600,
    prefix: 'app:',
    enabled: true,
  },
  features: ['dark-mode', 'notifications', 'export-csv'],
}

class EventEmitter {
  #listeners = new Map()

  on(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, [])
    }
    this.#listeners.get(event).push(callback)
    return this
  }

  emit(event, ...args) {
    const callbacks = this.#listeners.get(event) || []
    callbacks.forEach((cb) => cb(...args))
  }

  off(event, callback) {
    const callbacks = this.#listeners.get(event) || []
    this.#listeners.set(
      event,
      callbacks.filter((cb) => cb !== callback)
    )
  }
}

// Array manipulation with modern syntax
const processItems = (items) =>
  items
    .filter((item) => item.active && item.score > 0)
    .map(({ name, score, tags = [] }) => ({
      label: name.toUpperCase(),
      normalizedScore: Math.round(score * 100) / 100,
      tagCount: tags.length,
    }))
    .sort((a, b) => b.normalizedScore - a.normalizedScore)

export { fetchUser, config, EventEmitter, processItems }
