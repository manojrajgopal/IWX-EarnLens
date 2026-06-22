"""Email module.

A self-contained, deeply-layered feature package responsible for every
outbound email in IWX-EarnLens. The tree mirrors a clean architecture:

    email/
      constants/    -> event identifiers, subject lines, preference keys
      models/       -> internal value objects (OutboundMessage)
      schemas/      -> typed contexts passed in by callers
      providers/    -> how a message physically leaves the system
        base/       -> the provider contract
        google/     -> Gmail API over OAuth2 (oauth/ + client/)
        console/    -> dev fallback that logs instead of sending
      templates/    -> HTML/text builders, grouped by domain
        base/       -> shared layout + theme
        auth/       -> welcome, login, reset, changed
        income/     -> created, updated, deleted
      rendering/    -> turns (event + context) into a renderable message
      preferences/  -> per-user opt-in gate
      services/     -> high-level API (EmailService) + dispatch/
      utils/        -> MIME building, address formatting, safe-send
      dependencies/ -> FastAPI providers
      routers/      -> status + test-send endpoints
"""
