#!/usr/bin/env python3
"""Attach reviewed configuration plans to data.json.

Each recommendation is a reasoning chain: raw transcript lines pulled from the
Gong call file, what the statement means operationally, what the Entrata
setting actually does (checked in code), the value chosen, and the settings
considered and rejected. Raw lines are fetched by phrase so they are verbatim.
Silence stays on the Entrata factory default. Beam values are not copied.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "data.json"
GONG_DIR = Path(os.environ.get(
    "GONG_DIR",
    "/Users/bbayles/Developer/entrata-product/BrandonBayles-hub-workspace/"
    "Improvements/runs/knowledge-compiler/amplify-main/data/gong/calls",
))

PVM = "413545210721711719"
VIDALTA = "5680812542437674704"
SCOTT = "6551596972281120220"


def cite(call: str, find: str, before: int = 2, after: int = 4) -> dict:
    return {"call": call, "find": find, "before": before, "after": after}


PLANS = {
    "001VJ00001EP47tYAD": {
        "summary": "One setting changes. Everything else stays on the factory default.",
        "rows": [
            {
                "topic": "Who pays payment fees",
                "said": cite(PVM, "my tenants are paying all the fees", before=3, after=12),
                "meaning": "Residents pay the processing fee on their own payments today, and she wants to keep it that way. She was checking that Entrata would not make the property pay it.",
                "setting": "Require Property to Waive Convenience Fees",
                "path": "Setup >> Properties >> [property] >> Financial >> Payments >> General >> Convenience Fees >> Require Property to Waive Convenience Fees",
                "key": "REQUIRE_WAIVER_OF_CONVENIENCE_FEES",
                "codeRef": "Interfaces/Templates/Entrata/setup/properties/property/financial/payments/general/convenience_fees.tpl · Applications/Entrata/Application/Customers/Payments/CInsertArPaymentController.class.php",
                "does": "Applies when staff record a payment for a resident in Entrata. It shows only when Allow Property to Waive Convenience Fees is on. Turned on, every staff-entered payment has its fee waived, so the property absorbs it.",
                "options": [
                    {"value": "Yes", "effect": "Staff-entered payments always waive the fee. The property pays it."},
                    {"value": "No", "effect": "The resident pays the fee. Staff can still waive one when Allow is on."},
                ],
                "catalogDefault": "Yes (settings catalog)",
                "proposed": "No",
                "match": "Partial",
                "reasoning": [
                    "She said residents pay the fees today and asked to keep it that way.",
                    "With Yes, the property would pay the fee on every payment staff enter. That is the opposite of what she wants.",
                    "No keeps the fee on the resident. Staff can still waive one by exception.",
                ],
                "notCovered": "This does not decide who pays the fee on online payments residents make themselves. That is set in the merchant account's fee setup, which is not in the 901-setting catalog. It goes to the confirm list.",
                "rejected": [
                    {"setting": "Allow Property to Waive Convenience Fees", "why": "Leave on (catalog default Yes). She did not ask to stop staff from waiving a fee for one resident."},
                    {"setting": "Reverse convenience fees", "why": "This is for returned or reversed payments. She did not talk about that."},
                ],
                "status": "Recommended",
            }
        ],
        "questions": [
            {
                "question": "Should residents pay the fee on online payments?",
                "default": "Yes. Residents pay, which matches what she does today.",
                "why": "This is set in the merchant account fee setup, not a property setting. She said tenants pay today. She did not say whether storage tenants pay the same way.",
                "said": cite(PVM, "we have storage units too", before=1, after=3),
            },
            {
                "question": "After a renewal, waive late fees for one month if the new rent was not posted yet?",
                "default": "No. Charge late fees on the rent that is already posted.",
                "why": "She skips that month by hand because she is often late entering the renewal amount. The catalog has no one-month waiver. If renewal rent posts itself, the reason for the waiver goes away.",
                "said": cite(PVM, "I don't charge a late fee on someone", before=2, after=4),
            },
            {
                "question": "Which lease do residents e-sign?",
                "default": "Upload the Texas REALTOR lease she uses now.",
                "why": "She has a broker license and signs the Texas Association of Realtors lease, not TAA or Blue Moon. She asked whether her own lease can be loaded.",
                "said": cite(PVM, "Texas realtor's lease", before=0, after=4),
            },
        ],
        "gaps": [
            {"text": "Student housing is rented by the bedroom, and residents switch rooms often. No by-the-bed setting is in the catalog.", "said": cite(PVM, "switch rooms frequently", before=1, after=2)},
            {"text": "Move-in instructions (keys and utilities) go out from Monday.com today. That is message content, not a setting.", "said": cite(PVM, "Monday", before=0, after=3)},
        ],
    },
    "0015f00000v1MhAAAU": {
        "summary": "No setting change yet. The closest settings do not fix his problem without a number from him.",
        "rows": [],
        "questions": [
            {
                "question": "How many days does a turn actually take at the first property today?",
                "default": "Keep the make-ready template's Days to Complete, and add the real backlog once he gives a number.",
                "why": "Entrata sets a notice unit's available date to move-out plus the larger of the template's Days to Complete and 'Number Of days From Move Out Date To Show Notice Unit' (factory 0). His notice units show available too early because a backlog makes turns run longer than planned. A buffer only helps with a real number.",
                "setting": "Number Of days From Move Out Date To Show Notice Unit",
                "path": "S >> P >> Property >> Floor Plans & Units >> Unit Availability/Search >> Number Of days From Move Out Date To Show Notice Unit",
                "codeRef": "Libraries/Psi/Entrata/CoreConfiguration/CUnitAvailableOnLibrary.class.php (getAvailableOnDateByMaintenanceTemplate)",
                "said": cite(VIDALTA, "60 day out notice to vacate", before=1, after=8),
            },
            {
                "question": "Which properties go on Entrata?",
                "default": "The next acquisition only (fund 6). Current properties stay on RealPage.",
                "why": "He said switching the current portfolio would repeat a painful migration. A new fund can be its own company.",
                "said": cite(VIDALTA, "fund number six", before=1, after=4),
            },
        ],
        "rejectedSettings": [
            {
                "setting": "Use Make Ready Date As Available On Date",
                "why": "The code already uses the later of the move-out-based date and the make-ready end date. This toggle changes the result by one day at most, so it does not fix units showing weeks early.",
                "codeRef": "Libraries/Psi/Entrata/CoreConfiguration/CUnitAvailableOnLibrary.class.php",
            }
        ],
        "gaps": [
            {"text": "He wants to see how much is collected versus spent on each expense with a recovery (for example bulk internet), trended over time. That is reporting, not a setting.", "said": cite(VIDALTA, "bulk internet", before=1, after=2)},
            {"text": "He wants callbacks and daily volume per technician. That is reporting, not a setting.", "said": cite(VIDALTA, "how many callbacks", before=1, after=2)},
            {"text": "Maintenance runs on paper and manager-assigned priorities. He wants each technician to have a daily sequence.", "said": cite(VIDALTA, "piece of paper", before=1, after=3)},
            {"text": "He wants capex per unit, open purchase orders, and return against underwriting. That is reporting, not a setting.", "said": cite(VIDALTA, "Capex management is extremely critical", before=1, after=2)},
        ],
    },
    "0015f00000j3DGwAAM": {
        "summary": "No setting change. None of what they asked for maps to a setting with a value.",
        "rows": [],
        "questions": [],
        "gaps": [
            {"text": "Payments must go to rent before utilities. During a Maryland eviction, an overpayment has to stay for future rent. No payment-order setting is in the catalog.", "said": cite(SCOTT, "pay rent first", before=1, after=3)},
            {"text": "Emergency contact must be required and cannot be the applicant's own number. No matching setting is in the catalog.", "said": cite(SCOTT, "Emergency contact", before=1, after=4)},
            {"text": "A lump-sum move-in payment must split to the deposit ledger and still transfer on a management move. The catalog's deposit-transfer row is a different decision.", "said": cite(SCOTT, "deposit is actually linked", before=1, after=3)},
            {"text": "They need to start evictions in bulk. That is a workflow, not a setting.", "said": cite(SCOTT, "start eviction can be done in bulk", before=2, after=1)},
            {"text": "Require a photo before closing a water-leak work order. The catalog's photo settings are for inspections, not closing work orders.", "said": cite(SCOTT, "require a photo", before=1, after=2)},
        ],
    },
}


def load_transcript(call_id: str) -> list[dict]:
    for path in GONG_DIR.glob(f"*/{call_id}.json"):
        return json.loads(path.read_text()).get("transcript") or []
    raise SystemExit(f"call {call_id} not found under {GONG_DIR}")


def stamp(ms: int) -> str:
    return f"{int(ms // 60000):02d}:{int(ms % 60000 // 1000):02d}"


def resolve(ref: dict | None, cache: dict, calls: dict) -> dict | None:
    if not ref:
        return None
    lines = cache.setdefault(ref["call"], load_transcript(ref["call"]))
    needle = ref["find"].lower()
    hit = next((i for i, t in enumerate(lines) if needle in (t.get("text") or "").lower()), None)
    if hit is None:
        raise SystemExit(f"phrase not found in {ref['call']}: {ref['find']!r}")
    window = lines[max(0, hit - ref["before"]): hit + ref["after"] + 1]
    start = window[0].get("startMs") or 0
    call = calls.get(ref["call"]) or {}
    return {
        "callId": ref["call"],
        "callTitle": call.get("title") or "Gong call",
        "callDate": call.get("date"),
        "callUrl": call.get("url") or f"https://us-75228.app.gong.io/call?id={ref['call']}",
        "at": stamp(start),
        "lines": [
            {
                "t": stamp(t.get("startMs") or 0),
                "who": t.get("speaker") or "",
                "prospect": (t.get("affiliation") or "") == "External",
                "text": t.get("text") or "",
                "key": i + max(0, hit - ref["before"]) == hit,
            }
            for i, t in enumerate(window)
        ],
    }


def main() -> None:
    data = json.loads(OUT.read_text())
    cache: dict[str, list] = {}
    calls = {c["callId"]: c for co in data["companies"] for c in co.get("calls") or []}
    resolved = {}
    for cid, plan in PLANS.items():
        p = json.loads(json.dumps(plan))
        for row in p["rows"]:
            row["said"] = resolve(row["said"], cache, calls)
        for q in p["questions"]:
            q["said"] = resolve(q.get("said"), cache, calls)
        for g in p["gaps"]:
            g["said"] = resolve(g.get("said"), cache, calls)
        p.setdefault("rejectedSettings", [])
        resolved[cid] = p

    for company in data["companies"]:
        company["plan"] = resolved.get(company["id"])
        company["reviewed"] = company["plan"] is not None
    data["companies"].sort(key=lambda c: (not c["reviewed"], (c["name"] or "").lower()))
    data["generatedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    data["totals"]["reviewed"] = len(resolved)
    data["totals"]["overrides"] = sum(len(p["rows"]) for p in resolved.values())
    OUT.write_text(json.dumps(data, ensure_ascii=False))
    print(f"reviewed {len(resolved)} overrides {data['totals']['overrides']} bytes {OUT.stat().st_size}")


if __name__ == "__main__":
    main()
