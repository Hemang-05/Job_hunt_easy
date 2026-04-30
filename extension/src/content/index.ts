// ============================================================
// content/index.ts
//
// SYSTEM DESIGN: This script is injected into EVERY webpage.
// It must:
//   1. Be lightweight — never slow down the host page
//   2. Use Shadow DOM — never let our CSS bleed into host page
//   3. Never store sensitive data — no API keys, no resume text
//   4. Communicate ONLY via chrome.runtime.sendMessage
//
// It cannot call OpenRouter. It cannot access chrome.storage.
// It is the "eyes and hands" — the background is the "brain".
// ============================================================

// Let the dashboard know the extension is actively running
document.documentElement.setAttribute('data-job-hunt-easy-installed', 'true')

import { getFieldId, sanitizeQuestion } from '../shared/utils'
import type { ExtensionMessage } from '@job-hunt-easy/types'

// Map of fieldId → the actual DOM element
// Needed to target the right field when stream chunks arrive
const fieldRegistry = new Map<string, HTMLElement>()

// Track all wrappers by fieldId for easy lookup
const wrapperRegistry = new Map<string, HTMLElement>()

let isExtensionEnabled = true

chrome.storage.sync.get('settings', (data) => {
  if (data.settings) {
    isExtensionEnabled = data.settings.enabled ?? true
  }
  if (!isExtensionEnabled) {
    removeAllButtons()
  } else {
    // Only scan what's already on the page once we know we're enabled
    scanForFields(document.body)
  }
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.settings) {
    isExtensionEnabled = changes.settings.newValue?.enabled ?? true
    if (!isExtensionEnabled) {
      removeAllButtons()
    } else {
      scanForFields(document.body)
    }
  }
})

function removeAllButtons() {
  document.querySelectorAll('[data-job-hunt-easy-wrapper]').forEach((el) => el.remove())
  document.body.querySelectorAll('[data-job-hunt-easy-attached]').forEach((el) => {
    delete (el as HTMLElement).dataset.jobHuntEasyAttached
  })
  fieldRegistry.clear()
  wrapperRegistry.clear()
}

// ─── Keep-alive ────────────────────────────────────────────
// Prevents Chrome from killing the service worker during sessions
// SYSTEM DESIGN: Heartbeat pattern (Phase 5)
// Also acts as a self-healing mechanism: if the extension was
// reloaded, the ping will fail and we clean up zombie buttons.

const keepAliveInterval = setInterval(() => {
  chrome.runtime.sendMessage({ type: 'KEEP_ALIVE' }).catch(() => {
    // Extension context invalidated (extension was reloaded).
    // This content script is now a zombie — clean up everything.
    console.debug('[Job Hunt Easy] Extension context lost. Cleaning up zombie UI.')
    clearInterval(keepAliveInterval)
    removeAllButtons()
    observer.disconnect()
  })
}, 20_000)

// ─── MutationObserver ──────────────────────────────────────
// SYSTEM DESIGN: Modern job sites (Workday, Greenhouse) inject
// form fields dynamically via React/Angular after page load.
// We can't just run once at document_idle — we must watch continuously.

// Debounce scans to avoid hammering during rapid DOM mutations
let scanTimer: ReturnType<typeof setTimeout> | null = null

const observer = new MutationObserver((mutations) => {
  // Skip mutations caused by our own button injection
  let hasRelevant = false
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue
      const el = node as HTMLElement
      if (el.dataset?.jobHuntEasyWrapper) continue // our own wrapper
      hasRelevant = true
      break
    }
    if (hasRelevant) break
  }
  if (!hasRelevant) return

  // Debounce: wait 300ms of quiet before scanning
  if (scanTimer) clearTimeout(scanTimer)
  scanTimer = setTimeout(() => {
    scanForFields(document.body)
  }, 300)
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
})

// Initial scan relies on the async chrome.storage fetching callback above.

// ─── Field scanner ─────────────────────────────────────────

function scanForFields(root: Element) {
  // Only target real form inputs and textareas — NOT contenteditable
  // contenteditable creates massive spam on LinkedIn, Gmail, etc.
  const fields = root.querySelectorAll<HTMLElement>(
    'input[type="text"], input[type="email"], input[type="tel"], input:not([type]), textarea'
  )

  // Also check if root itself is a field
  const rootEl = root as HTMLElement
  if (isFormField(rootEl) && isRelevantField(rootEl)) attachFillButton(rootEl)

  fields.forEach((field) => {
    if (isRelevantField(field)) attachFillButton(field)
  })
}

/** Only true native form elements — no contenteditable divs */
function isFormField(el: HTMLElement): boolean {
  if (el instanceof HTMLTextAreaElement) return true
  if (el instanceof HTMLInputElement) {
    const validTypes = ['text', 'email', 'tel', '']
    return validTypes.includes(el.type)
  }
  return false
}

function isRelevantField(el: HTMLElement): boolean {
  if (!isExtensionEnabled) return false

  // Must be a real form field
  if (!isFormField(el)) return false

  // Skip if we already attached a button to this field
  if (el.dataset.jobHuntEasyAttached) return false
  
  // Visibility check
  if (el.offsetWidth === 0 || el.offsetHeight === 0) return false
  if (el.style.display === 'none' || el.style.visibility === 'hidden') return false
  
  // Modern visibility check (Chrome 105+)
  if ('checkVisibility' in el && !(el as any).checkVisibility()) return false

  // Skip tiny fields (zip codes, small number inputs etc.)
  if (el.offsetWidth < 120) return false

  // Skip fields that are clearly not for long-form answers
  if (el instanceof HTMLInputElement) {
    const skipTypes = ['password', 'hidden', 'checkbox', 'radio', 'file', 'submit', 'button', 'image', 'reset', 'color', 'date', 'datetime-local', 'month', 'number', 'range', 'search', 'time', 'url', 'week']
    if (skipTypes.includes(el.type)) return false
  }

  // Skip fields inside navbars, headers, search bars, toolbars
  const ancestor = el.closest(
    'nav, header, [role="navigation"], [role="banner"], [role="toolbar"], ' +
    '[role="search"], [role="menubar"], [role="menu"], [role="dialog"], ' +
    '.nav, .navbar, .header, .toolbar, .search-bar, .search-form'
  )
  if (ancestor) return false

  // Skip LinkedIn/social-media-specific patterns
  const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() ?? ''
  const placeholder = ((el as HTMLInputElement).placeholder || '').toLowerCase()
  const skipPatterns = ['search', 'filter', 'find', 'type a message', 'write a comment', 'add a comment', 'say something']
  if (skipPatterns.some(p => ariaLabel.includes(p) || placeholder.includes(p))) return false

  // Identify label/question and enforce >10 character threshold
  const label = extractQuestion(el)
  if (!label || label.length < 10) return false

  // Extra: skip if the extracted label looks like navigation/UI text
  const lower = label.toLowerCase()
  if (lower.includes('search') || lower.includes('filter') || lower === 'name') return false

  return true
}

// ─── Question extraction ───────────────────────────────────
// SYSTEM DESIGN: Fallback chain — try each strategy in order
// of reliability. Graceful degradation (Phase 4).

export function extractQuestion(el: HTMLElement): string {
  let labelText = ''

  // Strategy 1: <label for="fieldId">
  if (el.id) {
    const label = document.querySelector<HTMLElement>(`label[for="${CSS.escape(el.id)}"]`)
    if (label?.innerText.trim()) labelText = label.innerText.trim()
  }

  // Strategy 2: wrapping <label>
  if (!labelText) {
    const parentLabel = el.closest('label')
    if (parentLabel?.innerText.trim()) labelText = parentLabel.innerText.trim()
  }

  // Strategy 3: aria-label (accessibility attribute)
  if (!labelText) {
    const ariaLabel = el.getAttribute('aria-label')
    if (ariaLabel?.trim()) labelText = ariaLabel.trim()
  }

  // Strategy 4: aria-labelledby → find the labelling element
  if (!labelText) {
    const labelledBy = el.getAttribute('aria-labelledby')
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy)
      if (labelEl?.innerText.trim()) labelText = labelEl.innerText.trim()
    }
  }

  // Strategy 5: the element directly above in DOM
  if (!labelText) {
    const prev = el.previousElementSibling as HTMLElement | null
    if (prev?.innerText?.trim()) labelText = prev.innerText.trim()
  }

  // Strategy 6: parent's first child text (some Workday patterns)
  if (!labelText) {
    const parentText = el.parentElement?.firstChild?.textContent?.trim()
    if (parentText) labelText = parentText.trim()
  }

  // Strategy 7: Walk up the tree and look for previous siblings with text
  if (!labelText) {
    let current: HTMLElement | null = el
    // Only go up a few levels to avoid grabbing unrelated page headers
    for (let i = 0; i < 4; i++) {
      if (!current || current === document.body) break
      
      // Check previous siblings
      let prev = current.previousElementSibling as HTMLElement | null
      while (prev) {
        const text = prev.innerText?.trim() || prev.textContent?.trim()
        // Ignore single characters like just an asterisk "*"
        if (text && text.length > 2) {
          labelText = text
          break
        }
        prev = prev.previousElementSibling as HTMLElement | null
      }
      if (labelText) break
      
      current = current.parentElement
    }
  }

  // Strategy 8: Check for preceding text nodes directly within the parent
  if (!labelText) {
    let current: Node | null = el
    while (current) {
      current = current.previousSibling
      if (current && current.nodeType === Node.TEXT_NODE) {
        const text = current.textContent?.trim()
        if (text && text.length > 2) {
          labelText = text
          break
        }
      }
    }
  }

  // Also extract the placeholder independently
  const placeholder = (el as HTMLInputElement | HTMLTextAreaElement).placeholder || ''

  // Combine them to give maximum context to the AI
  let combined = labelText
  if (placeholder && placeholder.trim() && placeholder !== labelText) {
    if (combined) {
      combined = `${combined} (Hint: ${placeholder.trim()})`
    } else {
      combined = placeholder.trim()
    }
  }

  return sanitizeQuestion(combined)
}

// ─── Fill button injection ─────────────────────────────────
// SYSTEM DESIGN: Shadow DOM creates an isolated CSS context.
// Our styles cannot bleed into the host page, and the host
// page's styles cannot override ours.

function attachFillButton(field: HTMLElement) {
  field.dataset.jobHuntEasyAttached = 'true'

  const fieldId = getFieldId(field)
  fieldRegistry.set(fieldId, field)

  // Create a wrapper positioned fixed relative to the viewport
  const wrapper = document.createElement('div')
  wrapper.dataset.jobHuntEasyWrapper = 'true'
  wrapper.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    pointer-events: none;
    transition: opacity 0.15s ease-in-out;
  `

  // Shadow DOM — our isolated world
  const shadow = wrapper.attachShadow({ mode: 'open' })

  // Inject styles inside the shadow
  const style = document.createElement('style')
  style.textContent = `
    :host { all: initial; }
    .job-hunt-easy-btn {
      pointer-events: all;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 11px;
      font-family: system-ui, sans-serif;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(99,102,241,0.35);
      transition: opacity 0.15s, transform 0.1s;
      white-space: nowrap;
      line-height: 1;
    }
    .job-hunt-easy-btn:hover { opacity: 0.9; transform: scale(1.03); }
    .job-hunt-easy-btn:disabled { opacity: 0.6; cursor: wait; }
    .job-hunt-easy-btn.loading::after {
      content: '';
      width: 10px;
      height: 10px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `

  const button = document.createElement('button')
  button.className = 'job-hunt-easy-btn'
  
  // Set initial label based on field content
  const hasContent = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement ? !!field.value?.trim() : !!field.textContent?.trim()
  button.innerHTML = hasContent ? `<span>↻</span> Regenerate` : `<span>✦</span> Fill with AI`
  button.setAttribute('aria-label', 'Fill this field with AI using your resume')

  button.addEventListener('click', () => {
    const question = extractQuestion(field)
    if (!question) return

    const isRegeneration = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement ? !!field.value?.trim() : !!field.textContent?.trim()

    button.disabled = true
    button.classList.add('loading')
    button.innerHTML = `<span></span> Generating...`

    const jobContext = extractJobContext()

    chrome.runtime.sendMessage({
      type: 'FILL_REQUEST',
      payload: {
        question,
        fieldId,
        pageUrl: window.location.href,
        pageTitle: document.title,
        isRegeneration,
        jobContext,
      },
    }).catch(() => {
      // Extension was reloaded — this button is a zombie
      button.disabled = false
      button.classList.remove('loading')
      button.innerHTML = isRegeneration ? `<span>↻</span> Regenerate` : `<span>✦</span> Fill with AI`
      showErrorToast('Extension was updated. Please refresh this page (F5).')
      removeAllButtons()
    })
  })

  shadow.appendChild(style)
  shadow.appendChild(button)

  // Position the wrapper over the field — top-right inside the field
  positionWrapper(wrapper, field)
  document.body.appendChild(wrapper)
  wrapperRegistry.set(fieldId, wrapper)

  // Reposition on any scroll in any container ({ capture: true })
  const throttledPosition = createThrottledPositioner(wrapper, field)
 
  window.addEventListener('scroll', throttledPosition, { passive: true, capture: true })
  window.addEventListener('resize', throttledPosition, { passive: true })

  // Observe field for visibility/size changes
  const resizeObserver = new ResizeObserver(() => throttledPosition())
  resizeObserver.observe(field)

  // Store references for cleanup
  field.dataset.jobHuntEasyButtonId = fieldId
  ;(wrapper as any)._jobHuntEasyButton = button
  ;(wrapper as any)._fieldId = fieldId

  // Clean up if field is removed from DOM
  const fieldObserver = new MutationObserver(() => {
    if (!document.contains(field)) {
      wrapper.remove()
      fieldRegistry.delete(fieldId)
      wrapperRegistry.delete(fieldId)
      window.removeEventListener('scroll', throttledPosition, { capture: true })
      window.removeEventListener('resize', throttledPosition)
      resizeObserver.disconnect()
      fieldObserver.disconnect()
    }
  })
  fieldObserver.observe(document.body, { childList: true, subtree: true })
}

/** Throttled repositioner using rAF — max one reposition per frame */
function createThrottledPositioner(wrapper: HTMLElement, field: HTMLElement) {
  let ticking = false
  return () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      positionWrapper(wrapper, field)
      ticking = false
    })
  }
}

function positionWrapper(wrapper: HTMLElement, field: HTMLElement) {
  const rect = field.getBoundingClientRect()

  // If field is hidden or fully out of viewport, hide the button
  if (
    rect.height === 0 ||
    rect.width === 0 ||
    rect.bottom < 0 ||
    rect.top > window.innerHeight ||
    rect.right < 0 ||
    rect.left > window.innerWidth
  ) {
    wrapper.style.opacity = '0'
    wrapper.style.pointerEvents = 'none'
    return
  }

  wrapper.style.opacity = '1'
  wrapper.style.pointerEvents = 'none' // wrapper itself is none, button inside has pointer-events: all

  // Position button at the top-right corner of the field, slightly inset
  const btnWidth = 90 // approximate button width
  const btnHeight = 22 // approximate button height
  const padding = 4

  // For short fields (single-line inputs), position to the right outside
  if (rect.height < 45) {
    wrapper.style.top = `${rect.top + (rect.height - btnHeight) / 2}px`
    wrapper.style.left = `${rect.right + padding}px`
  } else {
    // For tall fields (textareas), position inside top-right corner
    wrapper.style.top = `${rect.top + padding}px`
    wrapper.style.left = `${rect.right - btnWidth - padding}px`
  }
}

// ─── Message listener ──────────────────────────────────────
// Receives stream chunks from the service worker and
// inserts them into the correct field

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  if (message.type === 'STREAM_CHUNK') {
    const { fieldId, chunk } = message.payload
    const field = fieldRegistry.get(fieldId)
    if (!field) return

    if (field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement) {
      // For React 16+ forms, we must use the native value setter prototype
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window[field.tagName === 'INPUT' ? 'HTMLInputElement' : 'HTMLTextAreaElement'].prototype,
        'value'
      )?.set
      
      if (nativeSetter) {
        nativeSetter.call(field, field.value + chunk)
      } else {
        field.value += chunk
      }
      
      // Trigger React/Angular/Vue synthetic events
      field.dispatchEvent(new Event('input', { bubbles: true }))
      field.dispatchEvent(new Event('change', { bubbles: true }))
    } else if (field.isContentEditable) {
      field.textContent += chunk
      field.dispatchEvent(new InputEvent('input', { bubbles: true }))
      field.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  if (message.type === 'STREAM_DONE') {
    const { fieldId } = message.payload
    resetButton(fieldId, true)
  }

  if (message.type === 'ERROR') {
    const { fieldId, message: errMsg } = message.payload
    resetButton(fieldId, false)
    showErrorToast(errMsg)
  }
})

function resetButton(fieldId: string, success: boolean = false) {
  const wrapper = wrapperRegistry.get(fieldId) as any
  const field = fieldRegistry.get(fieldId) as HTMLElement | undefined
  if (!wrapper?._jobHuntEasyButton || !field) return

  const btn: HTMLButtonElement = wrapper._jobHuntEasyButton
  
  const hasContent = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement ? !!field.value?.trim() : !!field.textContent?.trim()
  const defaultLabel = hasContent ? `<span>↻</span> Regenerate` : `<span>✦</span> Fill with AI`

  if (success) {
    btn.innerHTML = `<span style="color: #4ade80;">✓</span> Done`
    btn.classList.remove('loading')
    // Hold success state for 2 seconds, then reset
    setTimeout(() => {
      btn.disabled = false
      btn.innerHTML = defaultLabel
    }, 2000)
  } else {
    btn.disabled = false
    btn.classList.remove('loading')
    btn.innerHTML = defaultLabel
  }
}

function cleanIdAndName(str: string): string {
  // Convert camelCase or snake_case to Space Case
  let words = str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .trim()

  return words.length > 3 ? words : ''
}

// ─── Job Context Extraction ────────────────────────────────
function extractJobContext() {
  const hn = window.location.hostname
  let platform = hn.replace('www.', '')
  if (hn.includes('linkedin')) platform = 'LinkedIn'
  else if (hn.includes('greenhouse')) platform = 'Greenhouse'
  else if (hn.includes('lever')) platform = 'Lever'
  else if (hn.includes('workday')) platform = 'Workday'
  else if (hn.includes('ashby')) platform = 'Ashby'

  let companyName = ''
  let roleTitle = ''
  const title = document.title || ''
  
  if (platform === 'LinkedIn' && title.includes(' | ')) {
    const parts = title.split(' | ')
    roleTitle = parts[0]?.trim()
    companyName = parts[1]?.trim()
  } else if (platform === 'Greenhouse') {
    companyName = document.querySelector('.company-name')?.textContent?.trim() || ''
    roleTitle = document.querySelector('.app-title')?.textContent?.trim() || ''
  } else if (platform === 'Lever') {
    roleTitle = document.querySelector('.posting-headline h2')?.textContent?.trim() || ''
    companyName = title.split('-')[0]?.trim() || ''
  } else {
    // Generic fallback
    roleTitle = document.querySelector('h1')?.textContent?.trim() || ''
    companyName = title.split('-')[0]?.trim() || ''
  }

  // Cleanup huge strings just in case
  if (roleTitle.length > 200) roleTitle = roleTitle.slice(0, 200)
  if (companyName.length > 200) companyName = companyName.slice(0, 200)

  return { companyName, roleTitle, platform }
}

function showErrorToast(message: string) {
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    background: #ef4444; color: white;
    padding: 10px 16px; border-radius: 8px;
    font-family: system-ui; font-size: 13px;
    z-index: 2147483647; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `
  toast.textContent = `Job Hunt Easy: ${message}`
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 4000)
}
