"""The responsive HTML shell every email is wrapped in."""
from __future__ import annotations

from html import escape
from typing import Optional

from app.modules.email.templates.base.theme import EmailTheme

T = EmailTheme


def render_layout(
    *,
    heading: str,
    intro: str,
    body_html: str,
    cta_label: Optional[str] = None,
    cta_url: Optional[str] = None,
    accent: str = T.PRIMARY,
) -> str:
    """Compose a polished, inline-styled HTML email.

    Inline styles are used deliberately — most email clients strip <style>.
    """
    cta_block = ""
    if cta_label and cta_url:
        cta_block = f"""
        <tr>
          <td style="padding: 8px 0 4px;">
            <a href="{escape(cta_url)}"
               style="display:inline-block;background:{accent};color:#ffffff;
                      text-decoration:none;font-weight:600;font-size:15px;
                      padding:13px 26px;border-radius:10px;">
              {escape(cta_label)}
            </a>
          </td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{escape(heading)}</title>
</head>
<body style="margin:0;padding:0;background:{T.BG};font-family:{T.FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:{T.BG};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:560px;background:{T.CARD};border:1px solid {T.BORDER};
                      border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,{T.PRIMARY},{T.PRIMARY_DARK});
                       padding:22px 28px;">
              <span style="color:#ffffff;font-size:18px;font-weight:700;
                           letter-spacing:0.3px;">{escape(T.BRAND)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 12px;">
              <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3;color:{T.TEXT};">
                {escape(heading)}
              </h1>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:{T.TEXT_MUTED};">
                {intro}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td>{body_html}</td></tr>
                {cta_block}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;">
              <hr style="border:none;border-top:1px solid {T.BORDER};margin:0 0 16px;" />
              <p style="margin:0;font-size:12px;line-height:1.6;color:{T.TEXT_MUTED};">
                You received this email because of activity on your
                {escape(T.BRAND)} account. You can manage which emails you get
                from <strong>Settings &rarr; Email preferences</strong>.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:{T.TEXT_MUTED};">
          &copy; {escape(T.BRAND)}. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>"""
