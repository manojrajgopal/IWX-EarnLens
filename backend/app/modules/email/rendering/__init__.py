"""Turns an (event, context) pair into a ready-to-send OutboundMessage."""
from app.modules.email.rendering.template_renderer import TemplateRenderer

__all__ = ["TemplateRenderer"]
