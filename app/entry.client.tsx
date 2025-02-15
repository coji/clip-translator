import { HydratedRouter } from 'react-router/dom';
import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { initNotification } from './services/notification.client'

initNotification()

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  )
})
