import { escapeHtml } from './escape-html'

describe('escapeHtml', () => {
  it('neutralizes markup so it renders as plain text', () => {
    expect(escapeHtml('<a href="https://phish.example">Click</a>')).toBe(
      '&lt;a href=&quot;https://phish.example&quot;&gt;Click&lt;/a&gt;',
    )
  })

  it('escapes ampersands and single quotes', () => {
    expect(escapeHtml("Tom & Jerry's")).toBe('Tom &amp; Jerry&#39;s')
  })

  it('leaves regular names untouched', () => {
    expect(escapeHtml('María José Núñez')).toBe('María José Núñez')
  })
})
