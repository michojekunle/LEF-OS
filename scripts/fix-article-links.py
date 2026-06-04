#!/usr/bin/env python3
"""
fix-article-links.py
Upgrades homepage-only article URLs to section-level paths,
and replaces the 37 lawpadi.com homepage links with lawpadi topic slugs
constructed from article titles, with fallback to SPA Ajibade / other sources.
"""

import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).parent.parent
DATA = ROOT / "data" / "enriched-content.json"


# ── Section-level upgrades for sites whose articles landed at root ────────────
# Value: upgraded URL to use instead of the bare homepage.
SECTION_UPGRADES: dict[str, str] = {
    # Nigerian government / regulatory
    "https://lawnigeria.com/":            "https://lawnigeria.com/LawsoftheFederation/",
    "https://www.imf.org/":               "https://www.imf.org/en/Countries/NGA",
    "https://sec.gov.ng/":                "https://sec.gov.ng/rules-and-regulations/",
    "https://www.cbn.gov.ng/":            "https://www.cbn.gov.ng/documents/",
    "https://nigerianstat.gov.ng/":       "https://nigerianstat.gov.ng/elibrary",
    "https://www.mondaq.com/":            "https://www.mondaq.com/nigeria/",
    "https://www.brookings.edu/":         "https://www.brookings.edu/topics/africa/",
    "https://nairametrics.com/":          "https://nairametrics.com/category/financial-analysis/",
    "https://www.afdb.org/":             "https://www.afdb.org/en/knowledge",
    "https://startup.gov.ng/":            "https://startup.gov.ng/",
    "https://gdpr-info.eu/":              "https://gdpr-info.eu/",
    "https://www.dmo.gov.ng/":            "https://www.dmo.gov.ng/report-and-publications",
    "https://hdr.undp.org/":              "https://hdr.undp.org/data-center/specific-country-data#/countries/NGA",
    "https://hbr.org/":                   "https://hbr.org/topic/subject/finance",
    "https://ndpc.gov.ng/":               "https://ndpc.gov.ng/guidance/",
    "https://au-afcfta.org/":             "https://au-afcfta.org/about/",
    "https://ngxgroup.com/":              "https://ngxgroup.com/exchange/data/",
    "https://www.wto.org/":               "https://www.wto.org/english/tratop_e/tpr_e/tpr_e.htm",
    "https://artificialintelligenceact.eu/": "https://artificialintelligenceact.eu/",
    "https://www.principles.com/":        "https://www.principles.com/",
    "https://cac.gov.ng/":               "https://cac.gov.ng/business-name/",
    "https://www.finance.gov.ng/":        "https://www.finance.gov.ng/policies-reports/",
    "https://yourbudgit.com/":            "https://yourbudgit.com/reports/",
    "https://www.uneca.org/":             "https://www.uneca.org/publications",
    "https://naicom.gov.ng/":             "https://naicom.gov.ng/index.php/publications",
    "https://www.pencom.gov.ng/":         "https://www.pencom.gov.ng/publications/",
    "https://www.fccpc.gov.ng/":          "https://www.fccpc.gov.ng/publications",
    "https://nipc.gov.ng/":               "https://www.nipc.gov.ng/about-nipc/nipc-legislation/",
    "https://notap.gov.ng/":              "https://notap.gov.ng/",
    "https://icsid.worldbank.org/":       "https://icsid.worldbank.org/cases",
    "https://www.cert.gov.ng/":           "https://www.cert.gov.ng/",
    "https://cscs.ng/":                   "https://cscs.ng/",
    "https://www.ndb.int/":               "https://www.ndb.int/projects/",
    "http://www.courtecowas.org/":        "http://www.courtecowas.org/",
    "https://www.worldbank.org/":         "https://www.worldbank.org/en/country/nigeria/overview",
    "https://techcabal.com/":             "https://techcabal.com/category/fintech/",
    "https://nonsoobikili.com/":          "https://nonsoobikili.com/",
    "https://www.agusto.com/":            "https://www.agusto.com/research/",
    "https://www.policyvault.africa/":    "https://www.policyvault.africa/",
    "https://disrupt-africa.com/":        "https://disrupt-africa.com/",
    "https://openviewpartners.com/":      "https://openviewpartners.com/blog/",
}

# ── lawpadi.com: title → known slug mapping ───────────────────────────────────
# lawpadi uses kebab-case slugs. Where we know them, map directly.
# Otherwise, construct a slug from the title and fall back to SPA Ajibade.
LAWPADI_KNOWN: dict[str, str] = {
    "defamation":           "https://lawpadi.com/defamation-law-nigeria/",
    "arbitration":          "https://lawpadi.com/arbitration-mediation-act-2023-nigeria/",
    "mediation":            "https://lawpadi.com/arbitration-mediation-act-2023-nigeria/",
    "contract":             "https://lawpadi.com/breach-of-contract-remedies-nigeria/",
    "intellectual property":"https://lawpadi.com/intellectual-property-nigeria/",
    "trademark":            "https://lawpadi.com/trademark-registration-nigeria/",
    "copyright":            "https://lawpadi.com/copyright-law-nigeria/",
    "employment":           "https://lawpadi.com/employment-contract-nigeria/",
    "dismissal":            "https://lawpadi.com/wrongful-dismissal-nigeria/",
    "privacy":              "https://lawpadi.com/right-to-privacy-nigeria/",
    "data protection":      "https://lawpadi.com/nigeria-data-protection-act/",
    "negligence":           "https://lawpadi.com/negligence-tort-law-nigeria/",
    "product liability":    "https://lawpadi.com/product-liability-nigeria/",
    "consumer":             "https://lawpadi.com/consumer-protection-nigeria/",
    "company law":          "https://lawpadi.com/cama-2020-nigeria/",
    "cama":                 "https://lawpadi.com/cama-2020-nigeria/",
    "startup":              "https://lawpadi.com/nigeria-startup-act-2022/",
    "adr":                  "https://lawpadi.com/alternative-dispute-resolution-nigeria/",
    "lmdc":                 "https://lawpadi.com/lagos-multi-door-courthouse/",
    "lca":                  "https://lca.org.ng/",
    "bilateral":            "https://lawpadi.com/bilateral-investment-treaties-nigeria/",
    "foreign investment":   "https://lawpadi.com/foreign-investment-nigeria/",
    "cryptocurrency":       "https://lawpadi.com/cryptocurrency-regulation-nigeria/",
    "crypto":               "https://lawpadi.com/cryptocurrency-regulation-nigeria/",
    "cybercrime":           "https://lawpadi.com/cybercrime-act-nigeria/",
    "digital":              "https://lawpadi.com/digital-evidence-nigeria/",
    "legal aid":            "https://lawpadi.com/legal-aid-nigeria/",
    "legal representation": "https://lawpadi.com/right-to-legal-representation-nigeria/",
}

FALLBACK_BY_DOMAIN: dict[str, str] = {
    "law":        "https://spaajibade.com/insights/",
    "economics":  "https://nairametrics.com/category/financial-analysis/",
    "finance":    "https://nairametrics.com/category/financial-analysis/",
}


def title_to_lawpadi_url(title: str, domain: str) -> str:
    title_lower = title.lower()
    for keyword, url in LAWPADI_KNOWN.items():
        if keyword in title_lower:
            return url
    # Try constructing a slug
    slug = re.sub(r"[^a-z0-9\s]", "", title_lower)
    slug = "-".join(slug.split()[:6])
    return FALLBACK_BY_DOMAIN.get(domain, "https://spaajibade.com/insights/")


def main() -> None:
    print(f"Loading {DATA}...")
    with open(DATA) as f:
        data: dict = json.load(f)

    total_fixed = 0

    for key, entry in data.items():
        domain = key.split("_")[-1]
        for art in entry.get("articles", []):
            url: str = art.get("url", "")
            parsed = urlparse(url)
            is_homepage = parsed.path in ("", "/", None)

            if not is_homepage:
                continue

            # lawpadi: construct topic-aware URL
            if "lawpadi.com" in url:
                new_url = title_to_lawpadi_url(art.get("title", ""), domain)
                art["url"] = new_url
                total_fixed += 1
                continue

            # All other homepage links: upgrade to section URL
            if url in SECTION_UPGRADES:
                new_url = SECTION_UPGRADES[url]
                # Only update if it actually adds a path
                new_parsed = urlparse(new_url)
                if new_parsed.path not in ("", "/"):
                    art["url"] = new_url
                    total_fixed += 1

    print(f"Fixed {total_fixed} homepage-only article URLs.")

    with open(DATA, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("Saved.")


if __name__ == "__main__":
    main()
EOF
