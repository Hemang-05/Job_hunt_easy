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
let isGenerating = false

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
      padding: 4px 10px;
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
    if (isGenerating) return
    
    const question = extractQuestion(field)
    if (!question) return

    const isRegeneration = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement ? !!field.value?.trim() : !!field.textContent?.trim()

    isGenerating = true
    button.disabled = true
    button.classList.add('loading')
    button.innerHTML = `<span></span> Generating...`
    
    // Disable all other buttons to prevent concurrent API requests
    wrapperRegistry.forEach((w) => {
      const btn = (w as any)._jobHuntEasyButton as HTMLButtonElement
      if (btn && btn !== button) btn.disabled = true
    })

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
      isGenerating = false
      button.disabled = false
      button.classList.remove('loading')
      button.innerHTML = isRegeneration ? `<span>↻</span> Regenerate` : `<span>✦</span> Fill with AI`
      showSleekToast('Extension was updated. Please refresh this page (F5).', 'info')
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

    appendFieldValue(field, chunk)
  }

  if (message.type === 'STREAM_DONE') {
    const { fieldId, fullAnswer } = message.payload
    const field = fieldRegistry.get(fieldId)

    if (field && fullAnswer?.trim()) {
      ensureFinalFieldValue(field, fullAnswer)
    }

    const filledValue = field ? getFieldValue(field).trim() : ''
    const expectedValue = fullAnswer?.trim() ?? ''
    if (!field || (expectedValue && !filledValue.includes(expectedValue))) {
      console.warn('[Job Hunt Easy] Generated answer could not be inserted into the page field', {
        fieldId,
        expectedLength: expectedValue.length,
        actualLength: filledValue.length,
      })
      resetButton(fieldId, false)
      showSleekToast('Generated the answer, but this page blocked autofill. Click the field and try again.', 'error')
      return
    }

    resetButton(fieldId, true)
  }

  if (message.type === 'ERROR') {
    const { fieldId, message: errMsg, code } = message.payload
    resetButton(fieldId, false)
    if (code === 'DAILY_LIMIT_REACHED') {
      showLimitReachedModal()
      turnAllButtonsIntoUpgrade()
    } else if (code === 'UPGRADE_REQUIRED') {
      showProUpsellModal()
    } else if (code === 'NO_INFO_AVAILABLE') {
      showSleekToast('⚡ No relevant information found in your resume for this field.', 'info')
    } else if (code === 'RESUME_NOT_FOUND') {
      showSleekToast('📄 No resume found — open the Job Hunt Easy popup and upload your resume first.', 'info')
    } else if (code === 'API_RATE_LIMITED' || errMsg.includes('rate limit') || errMsg.includes('429')) {
      showSleekToast('⚡ Model is experiencing high load. Try switching to a different model in the popup, or upgrade to Pro for priority access.', 'info')
    } else {
      // Log all other errors to console only — never show ugly red errors to users
      console.warn('[Job Hunt Easy] Generation failed:', code, errMsg)
      showSleekToast(errMsg || 'AI could not generate an answer. Try another model from the popup.', 'error')
    }
  }
})

function getFieldValue(field: HTMLElement): string {
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return field.value
  }
  return field.textContent ?? ''
}

function setFieldValue(field: HTMLElement, value: string) {
  field.focus()

  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    const prototype = field instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : HTMLTextAreaElement.prototype
    const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set

    if (nativeSetter) {
      nativeSetter.call(field, value)
    } else {
      field.value = value
    }

    field.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }))
    field.dispatchEvent(new Event('change', { bubbles: true }))
    field.blur()
    field.focus()
    return
  }

  if (field.isContentEditable) {
    field.textContent = value
    field.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }))
    field.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

function appendFieldValue(field: HTMLElement, chunk: string) {
  setFieldValue(field, getFieldValue(field) + chunk)
}

function ensureFinalFieldValue(field: HTMLElement, fullAnswer: string) {
  const currentValue = getFieldValue(field)
  if (currentValue.trim().includes(fullAnswer.trim())) return
  setFieldValue(field, fullAnswer)
}

function turnAllButtonsIntoUpgrade() {
  wrapperRegistry.forEach((wrapper) => {
    const btn = (wrapper as any)._jobHuntEasyButton as HTMLButtonElement
    if (!btn) return
    
    btn.disabled = false
    btn.classList.remove('loading')
    btn.innerHTML = `<span style="font-size:12px;">👑</span> Upgrade Plan`
    btn.style.background = '#4f46e5'
    
    // Replace click listener to redirect
    const newBtn = btn.cloneNode(true) as HTMLButtonElement
    newBtn.addEventListener('click', (e) => {
      e.preventDefault()
      window.open('https://job-hunt-easy-dashboard.vercel.app/pricing', '_blank')
    })
    btn.parentNode?.replaceChild(newBtn, btn)
    ;(wrapper as any)._jobHuntEasyButton = newBtn
  })
}

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
      isGenerating = false
      btn.disabled = false
      btn.innerHTML = defaultLabel
      // Re-enable other buttons
      wrapperRegistry.forEach((w) => {
        const otherBtn = (w as any)._jobHuntEasyButton as HTMLButtonElement
        if (otherBtn) otherBtn.disabled = false
      })
    }, 2000)
  } else {
    isGenerating = false
    btn.disabled = false
    btn.classList.remove('loading')
    btn.innerHTML = defaultLabel
    // Re-enable other buttons
    wrapperRegistry.forEach((w) => {
      const otherBtn = (w as any)._jobHuntEasyButton as HTMLButtonElement
      if (otherBtn) otherBtn.disabled = false
    })
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

function showSleekToast(message: string, type: 'info' | 'error' = 'info') {
  // Remove any existing toast first
  document.getElementById('job-hunt-easy-toast')?.remove()

  const toast = document.createElement('div')
  toast.id = 'job-hunt-easy-toast'
  const bgColor = type === 'info' ? 'rgba(17, 17, 27, 0.95)' : 'rgba(17, 17, 27, 0.95)'
  const borderColor = type === 'info' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(239, 68, 68, 0.4)'
  const iconColor = type === 'info' ? '#818cf8' : '#f87171'
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px;
    background: ${bgColor}; color: #e0e4f5;
    padding: 14px 20px; border-radius: 12px;
    font-family: system-ui, -apple-system, sans-serif; font-size: 13px;
    line-height: 1.5;
    z-index: 2147483647;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    border: 1px solid ${borderColor};
    backdrop-filter: blur(12px);
    max-width: 360px;
    animation: jheFadeIn 0.3s ease-out;
  `

  // Add animation keyframes
  const styleEl = document.createElement('style')
  styleEl.textContent = `@keyframes jheFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`
  toast.appendChild(styleEl)

  const content = document.createElement('div')
  content.style.cssText = 'display: flex; align-items: flex-start; gap: 10px;'
  content.innerHTML = `
    <span style="color: ${iconColor}; font-size: 16px; flex-shrink: 0; margin-top: 1px;">⚡</span>
    <span>${message}</span>
  `
  toast.appendChild(content)
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s'
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(8px)'
    setTimeout(() => toast.remove(), 300)
  }, 6000)
}

function showProUpsellModal() {
  if (document.getElementById('job-hunt-easy-pro-modal')) return

  const container = document.createElement('div')
  container.id = 'job-hunt-easy-pro-modal'
  container.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 2147483647; font-family: system-ui, -apple-system, sans-serif;
  `

  const shadowRoot = container.attachShadow({ mode: 'open' })

  shadowRoot.innerHTML = `
    <style>
      .modal {
        background: #fff; width: 420px; border-radius: 16px;
        padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        position: relative; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .close {
        position: absolute; top: 16px; right: 16px; background: none; border: none;
        font-size: 20px; cursor: pointer; color: #9ca3af;
      }
      .close:hover { color: #374151; }
      .icon {
        width: 48px; height: 48px; border-radius: 14px; background: #eef2ff;
        color: #4f46e5; display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px; font-weight: 800; font-size: 20px;
      }
      h2 { margin: 0 0 12px; font-size: 22px; color: #111827; text-align: center; line-height: 1.3; }
      p { margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6; text-align: center; }
      .features { background: #f3f4f6; border-radius: 12px; padding: 16px; margin: 22px 0; color: #374151; font-size: 14px; line-height: 1.8; }
      .features strong { color: #111827; }
      .upgrade-btn {
        display: block; width: 100%; padding: 14px; background: #4f46e5;
        color: white; border: none; border-radius: 8px; font-size: 15px;
        font-weight: 700; cursor: pointer; text-align: center; text-decoration: none;
      }
      .upgrade-btn:hover { background: #4338ca; }
      .later-btn {
        display: block; width: 100%; padding: 12px; background: none;
        border: none; color: #6b7280; font-size: 14px; margin-top: 8px;
        cursor: pointer; text-align: center;
      }
    </style>
    <div class="modal">
      <button class="close">x</button>
      <div class="icon">Pro</div>
      <h2>Premium models are included with Pro</h2>
      <p>Upgrade to unlock smarter models and keep filling applications without the free daily cap.</p>
      <div class="features">
        <div><strong>Unlimited</strong> autofill sessions</div>
        <div><strong>Premium</strong> AI models</div>
        <div><strong>Priority</strong> job application workflow</div>
      </div>
      <a href="https://job-hunt-easy-dashboard.vercel.app/pricing" target="_blank" class="upgrade-btn">
        View Pro pricing
      </a>
      <button class="later-btn">Keep using free model</button>
    </div>
  `

  document.body.appendChild(container)

  const closeBtn = shadowRoot.querySelector('.close') as HTMLButtonElement
  const laterBtn = shadowRoot.querySelector('.later-btn') as HTMLButtonElement
  const upgradeBtn = shadowRoot.querySelector('.upgrade-btn') as HTMLAnchorElement

  const close = () => container.remove()

  closeBtn.onclick = close
  laterBtn.onclick = close
  upgradeBtn.onclick = close
}

function showLimitReachedModal() {
  if (document.getElementById('job-hunt-easy-limit-modal')) return

  const container = document.createElement('div')
  container.id = 'job-hunt-easy-limit-modal'
  container.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 2147483647; font-family: system-ui, -apple-system, sans-serif;
  `

  const shadowRoot = container.attachShadow({ mode: 'open' })

  const modalHtml = `
    <style>
      .modal {
        background: #0c0a1d; width: 420px; border-radius: 20px;
        padding: 36px 32px; position: relative;
        animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(99, 102, 241, 0.2);
        box-shadow: 0 0 80px rgba(99, 102, 241, 0.15), 0 20px 40px rgba(0,0,0,0.4);
      }
      @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .close {
        position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
        font-size: 16px; cursor: pointer; color: rgba(255,255,255,0.4); transition: all 0.15s;
      }
      .close:hover { color: white; background: rgba(255,255,255,0.1); }
      .badge {
        display: inline-flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 20px;
        padding: 5px 14px; font-size: 11px; font-weight: 700; color: #a5b4fc;
        text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px;
      }
      .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 8px rgba(99,102,241,0.8); }
      h2 {
        margin: 0 0 8px; font-size: 24px; color: #fff; font-weight: 800;
        letter-spacing: -0.3px; line-height: 1.3;
      }
      .sub { color: rgba(255,255,255,0.45); font-size: 14px; font-weight: 500; margin-bottom: 24px; line-height: 1.5; }
      .info-card {
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
        border-radius: 14px; padding: 18px 20px; margin-bottom: 20px;
      }
      .info-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 8px 0; font-size: 13px; font-weight: 500;
      }
      .info-row:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.05); }
      .info-label { color: rgba(255,255,255,0.5); }
      .info-value { color: #fff; font-weight: 700; }
      .info-value.pro { color: #a5b4fc; }
      .stats {
        display: flex; align-items: center; gap: 8px; margin-bottom: 24px;
        color: #6366f1; font-weight: 600; font-size: 13px; justify-content: center;
      }
      .upgrade-btn {
        display: block; width: 100%; padding: 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white; border: none; border-radius: 12px; font-size: 15px;
        font-weight: 700; cursor: pointer; text-align: center; text-decoration: none;
        transition: all 0.2s; letter-spacing: -0.2px;
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
      }
      .upgrade-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(99, 102, 241, 0.5); }
      .later-btn {
        display: block; width: 100%; padding: 12px; background: none;
        border: none; color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 10px;
        cursor: pointer; text-align: center; font-weight: 500; transition: color 0.15s;
      }
      .later-btn:hover { color: rgba(255,255,255,0.6); }
    </style>
    <div class="modal">
      <button class="close">×</button>
      <div class="badge"><span class="badge-dot"></span> Daily Limit Reached</div>
      <h2>You're on fire! 🔥</h2>
      <p class="sub">You've completed 5 applications today. Upgrade to Pro to keep your momentum going.</p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Free Plan</span>
          <span class="info-value">5 apps/day</span>
        </div>
        <div class="info-row">
          <span class="info-label">Pro Plan</span>
          <span class="info-value pro">✦ Unlimited</span>
        </div>
        <div class="info-row">
          <span class="info-label">AI Models</span>
          <span class="info-value pro">✦ GPT-5.4 + Gemini</span>
        </div>
      </div>

      <div class="stats">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
        Pro users complete 30+ applications per day
      </div>

      <a href="https://job-hunt-easy-dashboard.vercel.app/pricing" target="_blank" class="upgrade-btn">
        Upgrade to Pro →
      </a>
      <button class="later-btn">Continue manually</button>
    </div>
  `

  shadowRoot.innerHTML = modalHtml
  document.body.appendChild(container)

  const closeBtn = shadowRoot.querySelector('.close') as HTMLButtonElement
  const laterBtn = shadowRoot.querySelector('.later-btn') as HTMLButtonElement
  const upgradeBtn = shadowRoot.querySelector('.upgrade-btn') as HTMLAnchorElement

  const close = () => container.remove()
  
  closeBtn.onclick = close
  laterBtn.onclick = close
  upgradeBtn.onclick = close
}
