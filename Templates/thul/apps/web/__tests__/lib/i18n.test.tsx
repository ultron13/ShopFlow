import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nProvider, useI18n, LOCALES, type Locale } from '@/lib/i18n'

function TestConsumer() {
  const { locale, t } = useI18n()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="products-nav">{t.nav.products}</span>
    </div>
  )
}

function TestSwitcher({ to }: { to: Locale }) {
  const { locale, t, setLocale } = useI18n()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="products-nav">{t.nav.products}</span>
      <button onClick={() => setLocale(to)}>switch</button>
    </div>
  )
}

describe('LOCALES', () => {
  it('includes all 7 official SA languages', () => {
    expect(LOCALES).toHaveLength(7)
  })

  it('includes English', () => {
    expect(LOCALES.some((l) => l.code === 'en')).toBe(true)
  })

  it('includes Zulu', () => {
    expect(LOCALES.some((l) => l.code === 'zu')).toBe(true)
  })

  it('includes Afrikaans', () => {
    expect(LOCALES.some((l) => l.code === 'af')).toBe(true)
  })

  it('includes Venda, Xhosa, Sepedi, Sesotho', () => {
    const codes = LOCALES.map((l) => l.code)
    expect(codes).toContain('ve')
    expect(codes).toContain('xh')
    expect(codes).toContain('nso')
    expect(codes).toContain('st')
  })

  it('every locale has code, label, nativeLabel', () => {
    for (const locale of LOCALES) {
      expect(locale.code).toBeTruthy()
      expect(locale.label).toBeTruthy()
      expect(locale.nativeLabel).toBeTruthy()
    }
  })
})

describe('I18nProvider — default state', () => {
  beforeEach(() => localStorage.clear())

  it('renders children', () => {
    render(
      <I18nProvider>
        <div data-testid="child">hello</div>
      </I18nProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('provides English locale by default', () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    )
    expect(screen.getByTestId('locale').textContent).toBe('en')
  })

  it('provides nav.products translation', () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    )
    expect(screen.getByTestId('products-nav').textContent).toBeTruthy()
  })

  it('English nav.products is "All Products"', () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    )
    expect(screen.getByTestId('products-nav').textContent).toBe('All Products')
  })
})

describe('I18nProvider — locale persistence', () => {
  beforeEach(() => localStorage.clear())

  it('restores saved Zulu locale from localStorage', async () => {
    localStorage.setItem('shopflow-locale', 'zu')
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    )
    await act(async () => {
      await new Promise((r) => setTimeout(r, 200))
    })
    expect(screen.getByTestId('locale').textContent).toBe('zu')
  })

  it('restores saved Afrikaans locale', async () => {
    localStorage.setItem('shopflow-locale', 'af')
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    )
    await act(async () => {
      await new Promise((r) => setTimeout(r, 200))
    })
    expect(screen.getByTestId('locale').textContent).toBe('af')
  })
})

describe('I18nProvider — setLocale', () => {
  beforeEach(() => localStorage.clear())

  it('switches to Zulu', async () => {
    render(
      <I18nProvider>
        <TestSwitcher to="zu" />
      </I18nProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'switch' }))
    await act(async () => { await new Promise((r) => setTimeout(r, 300)) })
    expect(screen.getByTestId('locale').textContent).toBe('zu')
  })

  it('switches to Afrikaans and translates nav', async () => {
    render(
      <I18nProvider>
        <TestSwitcher to="af" />
      </I18nProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'switch' }))
    await act(async () => { await new Promise((r) => setTimeout(r, 300)) })
    expect(screen.getByTestId('locale').textContent).toBe('af')
    expect(screen.getByTestId('products-nav').textContent).not.toBe('All Products')
  })

  it('switches to Venda', async () => {
    render(
      <I18nProvider>
        <TestSwitcher to="ve" />
      </I18nProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'switch' }))
    await act(async () => { await new Promise((r) => setTimeout(r, 300)) })
    expect(screen.getByTestId('locale').textContent).toBe('ve')
  })

  it('switches to Xhosa', async () => {
    render(
      <I18nProvider>
        <TestSwitcher to="xh" />
      </I18nProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'switch' }))
    await act(async () => { await new Promise((r) => setTimeout(r, 300)) })
    expect(screen.getByTestId('locale').textContent).toBe('xh')
  })

  it('switches to Sepedi', async () => {
    render(
      <I18nProvider>
        <TestSwitcher to="nso" />
      </I18nProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'switch' }))
    await act(async () => { await new Promise((r) => setTimeout(r, 300)) })
    expect(screen.getByTestId('locale').textContent).toBe('nso')
  })

  it('switches to Sesotho', async () => {
    render(
      <I18nProvider>
        <TestSwitcher to="st" />
      </I18nProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'switch' }))
    await act(async () => { await new Promise((r) => setTimeout(r, 300)) })
    expect(screen.getByTestId('locale').textContent).toBe('st')
  })

  it('persists locale choice in localStorage', async () => {
    render(
      <I18nProvider>
        <TestSwitcher to="zu" />
      </I18nProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'switch' }))
    await act(async () => { await new Promise((r) => setTimeout(r, 300)) })
    expect(localStorage.getItem('shopflow-locale')).toBe('zu')
  })

  it('switches back to English', async () => {
    render(
      <I18nProvider>
        <TestSwitcher to="en" />
      </I18nProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: 'switch' }))
    await act(async () => { await new Promise((r) => setTimeout(r, 300)) })
    expect(screen.getByTestId('locale').textContent).toBe('en')
    expect(screen.getByTestId('products-nav').textContent).toBe('All Products')
  })
})

describe('useI18n', () => {
  it('returns default context when used without provider', () => {
    function Bare() {
      const { locale } = useI18n()
      return <span data-testid="locale">{locale}</span>
    }
    render(<Bare />)
    expect(screen.getByTestId('locale').textContent).toBe('en')
  })
})
