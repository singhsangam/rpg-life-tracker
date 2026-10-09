import { useState } from 'react'
import type { Redemption, ShopItem } from '../types'

type Props = {
  items: ShopItem[]
  availableXp: number
  redemptions: Redemption[]
  onRedeem: (id: string) => void
  onAdd: (item: Omit<ShopItem, 'id' | 'redeemedCount'>) => void
}

export function RewardsShop({ items, availableXp, redemptions, onRedeem, onAdd }: Props) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState(250)

  return (
    <section className="panel">
      <header className="panel__head">
        <div>
          <h2>Rewards Shop</h2>
          <p className="muted">Spend XP on real-life rewards</p>
        </div>
        <span className="pill pill--xp">{availableXp} XP</span>
      </header>

      <form
        className="inline-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim()) return
          onAdd({ name: name.trim(), cost, tier: 'Custom' })
          setName('')
        }}
      >
        <input placeholder="Custom reward" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          type="number"
          min={50}
          value={cost}
          onChange={(e) => setCost(Number(e.target.value) || 0)}
        />
        <button type="submit" className="btn btn--ghost">
          Add
        </button>
      </form>

      <div className="shop-grid">
        {items.map((item) => {
          const can = availableXp >= item.cost
          return (
            <article key={item.id} className="shop-card">
              <div>
                <p className="eyebrow">{item.tier}</p>
                <h3>{item.name}</h3>
                <p className="muted">{item.cost} XP</p>
              </div>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!can}
                onClick={() => onRedeem(item.id)}
              >
                Redeem
              </button>
            </article>
          )
        })}
      </div>

      {redemptions.length > 0 && (
        <div className="redeem-log">
          <h3>Recent redemptions</h3>
          <ul>
            {redemptions.slice(0, 5).map((r) => (
              <li key={r.id}>
                {r.name} · −{r.cost} XP · {new Date(r.at).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
