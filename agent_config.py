"""
1INAI Agent Bridge — Pulsyn CDC Platform integration.

Usage from any file in pulsyn/:
    from agent_config import ask, find, check

    result = ask("Add retry logic to the connector", skill="code")
"""

import sys
from pathlib import Path

_pulsyn_dir = Path(__file__).resolve().parent
_platform_root = Path(r"C:\Users\onein\1inai-platform")
_bridge_path = _platform_root / ".agent" / "swarm" / "a2a"

if str(_bridge_path) not in sys.path:
    sys.path.insert(0, str(_bridge_path))

from agent_sdk import AgentSDK, AgentCard, AgentResponse, UsageTracker, check_credentials

_sdk = None
def _get_sdk():
    global _sdk
    if _sdk is None: _sdk = AgentSDK()
    return _sdk

def ask(prompt, skill="code", agent=None, context=None, system=None, max_tokens=4096, fallback=True):
    sdk = _get_sdk()
    if agent: return sdk.call(agent, prompt, context, system, max_tokens)
    return sdk.run(prompt, skill, context, system, max_tokens, fallback=fallback)

def find(skill, prefer_cheapest=True):
    return _get_sdk().find_agent(skill, prefer_cheapest)

def list_agents():
    return _get_sdk().list_agents()

def check():
    return check_credentials()

def usage():
    return _get_sdk().usage()
