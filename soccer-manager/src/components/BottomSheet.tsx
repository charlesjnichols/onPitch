import { useEffect } from 'react'

export default function BottomSheet({ open, onClose, children, title }: { open: boolean, onClose: () => void, children: React.ReactNode, title?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute left-0 right-0 bottom-0 bg-neutral-900 border-t border-neutral-800 rounded-t-xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 w-12 bg-neutral-700 rounded mx-auto mb-3" />
        {title && <div className="text-sm text-neutral-300 mb-2">{title}</div>}
        {children}
        <div className="mt-3 grid gap-2">
          <button className="px-3 py-2 rounded border border-neutral-700 bg-neutral-800 text-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}