import urllib.parse
from fastapi import APIRouter
from backend.app.schemas.icebreaker import IcebreakerRequest, IcebreakerResponse
from backend.app.services.ai.manager import ai_manager

router = APIRouter(prefix="/icebreaker", tags=["Icebreaker"])


@router.post("", response_model=IcebreakerResponse)
async def generate_icebreaker(request: IcebreakerRequest):
    """
    On-demand channel and tone adaptive icebreaker generator.
    Supports 6 styles: casual, friendly, professional, short, introvert, in_person.
    Supports 3 channels: WhatsApp, Discord, Slack.
    """
    raw_ice = await ai_manager.generate_icebreaker(
        item_name=request.item_name,
        category=request.category,
        contact_lead=request.contact_lead,
        style=request.style,
        user_context=request.user_context or request.category,
    )

    lead_name = request.contact_lead.split()[0] if request.contact_lead else "there"

    # Channel-specific formatting
    if request.channel == "discord":
        formatted = f"Hey **{request.contact_lead}**! 🚀\n> {raw_ice}\n*(Found via MatchMyVibe)*"
    elif request.channel == "slack":
        formatted = f"*Hey {lead_name}!* 👋\n_{raw_ice}_\n`MatchMyVibe Campus Hub`"
    else:  # WhatsApp or plain
        formatted = raw_ice

    wa_url = f"https://wa.me/?text={urllib.parse.quote(formatted)}"

    return IcebreakerResponse(
        icebreaker=raw_ice,
        style=request.style,
        channel=request.channel,
        formatted_text=formatted,
        whatsapp_share_url=wa_url,
    )
