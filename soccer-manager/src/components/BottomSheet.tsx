import { useEffect } from 'react'
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

export default function BottomSheet({ open, onClose, children, title }: { open: boolean, onClose: () => void, children: React.ReactNode, title?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        {title && <DialogTitle>{title}</DialogTitle>}
        <DialogContent>
        {children}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
  )
}