"""Low-level email helpers: MIME building, addresses, safe dispatch."""
from app.modules.email.utils.address import format_address
from app.modules.email.utils.mime_builder import build_raw_message

__all__ = ["format_address", "build_raw_message"]
