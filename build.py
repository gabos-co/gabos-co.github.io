#!/usr/bin/env python3
"""gabos.co oldalgenerator.

Egy helyen all a tartalom ket nyelven, es ebbol keszul minden aloldal.
Igy nem csuszik szet a magyar es az angol valtozat, es ha egy szoveg
valtozik, egy helyen kell atirni.

A nyitolap (index.html) kezzel keszult, azt nem generaljuk ujra: abbol
a magyar valtozat forditassal keszul (hu/index.html).

    python3 build.py
"""
import os
import re
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://gabos.co"

# ---------------------------------------------------------------- tartalom

PROJECTS = [
    {
        "slug": {"en": "ratio-muhely", "hu": "ratio-muhely"},
        "title": "Ratio Műhely",
        "kind": {"en": "Visual identity for a cultural podcast",
                 "hu": "Arculat egy kulturális podcasthoz"},
        "year": "2024",
        "lead": {
            "en": "A culturally focused podcast on Hungarian history and literature.",
            "hu": "Magyar történelemmel és irodalommal foglalkozó kulturális műsor.",
        },
        "body": {
            "en": [
                "The logo carries both a head and a headphone motif, formed by two "
                "back-to-back R letters broken down into their simplest shapes. In the "
                "negative space a white flag appears, alluding to the historical context.",
                "The flag motif repeats across the pattern that runs through the printed "
                "material, from the business cards to the covers. The palette stays close "
                "to the subject: rich black, a vibrant red that has accompanied the events "
                "of history, and a bronze green drawn from the oxidation of copper statues.",
            ],
            "hu": [
                "A jel két háttal álló R betűből épül fel, a legegyszerűbb formákra bontva, "
                "és fejet meg fejhallgatót is kiad. A negatív térben fehér zászló jelenik "
                "meg, ami a történelmi kontextusra utal.",
                "Ugyanez a zászlómotívum ismétlődik a mintában, ami végigfut a nyomdai "
                "anyagokon, a névjegytől a borítókig. A színek a témához tapadnak: mély "
                "fekete, egy élénk vörös, ami a történelem eseményeit végigkísérte, és egy "
                "bronzzöld, ami a rézszobrok oxidációjából jön.",
            ],
        },
        "shots": [
            ("img/ratio.jpg", {"en": "Ratio Műhely business cards with red and green geometric patterns on black.",
                               "hu": "Ratio Műhely névjegykártyák piros és zöld geometrikus mintával, fekete alapon."}),
            ("img/ratio-mark.jpg", {"en": "The Ratio Műhely mark: two back-to-back R letters forming a head and headphones.",
                                    "hu": "A Ratio Műhely jele: két háttal álló R betű fej és fejhallgató formában."}),
        ],
    },
    {
        "slug": {"en": "ght-sys", "hu": "ght-sys"},
        "title": "GHT-SYS",
        "kind": {"en": "Visual identity and campaign for an IT company",
                 "hu": "Arculat és kampány egy informatikai cégnek"},
        "year": "2023",
        "lead": {
            "en": "A company that builds and operates information technology and systems.",
            "hu": "Informatikai rendszereket fejlesztő és üzemeltető cég.",
        },
        "body": {
            "en": [
                "Within a few years the company became involved internationally across most "
                "areas of IT development. The identity was made to support that growth.",
                "An anthracite base carries two strong complementary colours, and the "
                "typeface is tuned to programming and printed circuit boards. The system "
                "runs from business cards through work attire to the campaign posters.",
            ],
            "hu": [
                "A cég néhány év alatt nemzetközi szinten is jelen lett az IT-fejlesztés "
                "csaknem minden területén. Az arculat ezt a folyamatos növekedést szolgálja ki.",
                "Antracit alapszín, mellette két erős kiegészítő szín, és a programozáshoz "
                "meg a nyáktervekhez hangolt tipográfia. A rendszer a névjegytől a "
                "munkaruhán át a kampányplakátokig végigfut.",
            ],
        },
        "shots": [
            ("img/ghtsys.jpg", {"en": "GHT-SYS poster at a tram stop at night, white type on orange.",
                                "hu": "GHT-SYS plakát egy esti villamosmegállóban, narancs alapon fehér szöveggel."}),
        ],
    },
    {
        "slug": {"en": "alpok-water", "hu": "alpok-water"},
        "title": "Alpok Water",
        "kind": {"en": "Identity, packaging and online store",
                 "hu": "Arculat, csomagolás és webáruház"},
        "year": "2023",
        "lead": {
            "en": "A company operating across Europe that improves water quality at both "
                  "residential and industrial levels.",
            "hu": "Európa-szerte működő cég, amely lakossági és ipari szinten is "
                  "vízminőség-javítással foglalkozik.",
        },
        "body": {
            "en": [
                "The aim is to bring tap water to a level where nobody needs to reach for "
                "bottled mineral water. The mark holds a mountain and a drop of water in "
                "one form.",
                "On ELIX, the flagship reverse-osmosis purifier, the X of the logotype works "
                "as the filter itself. The pack is blue rather than the competition's white, "
                "so it separates on the shelf and carries the brand at a glance.",
            ],
            "hu": [
                "A cél, hogy a csapvíz eljusson arra a szintre, ahol nem kell palackozott "
                "ásványvízért nyúlni. A jel a hegyet és a vizet fogja egy formába.",
                "A zászlóshajó terméken, az ELIX fordított ozmózisos víztisztítón a logó X "
                "betűje maga a szűrő. A doboz a versenytársak fehérje helyett kék, hogy "
                "elváljon a polcon, és egy pillantásra vigye a márkát.",
            ],
        },
        "shots": [
            ("img/alpok-mark.jpg", {"en": "The Alpok Water mark over a mountain peak: a drop of water inside the mountain.",
                                    "hu": "Az Alpok Water jele hegycsúcs fölé illesztve: a hegy formájában a víz cseppje."}),
            ("img/elixpack.jpg", {"en": "ELIX water purifier packaging and identity board.",
                                  "hu": "Az ELIX víztisztító csomagolása és arculati táblája."}),
            ("img/alpok.jpg", {"en": "Alpok Water online store home screen in desktop and mobile view.",
                               "hu": "Alpok Water webáruház nyitóképernyője asztali és mobil nézetben."}),
        ],
    },
    {
        "slug": {"en": "campus-swiss", "hu": "campus-swiss"},
        "title": "Campus.swiss",
        "kind": {"en": "Interface design for a learning platform",
                 "hu": "Felülettervezés egy oktatási platformhoz"},
        "year": "2021",
        "lead": {
            "en": "Login, marketplace, training data sheet and registration.",
            "hu": "Belépés, piactér, képzési adatlap és regisztráció.",
        },
        "body": {
            "en": [
                "The full flow of a learning platform, from the first click through to the "
                "order summary, designed alongside the developers who built it.",
                "The same work continued on the Swiss Re webinar platform: login, "
                "marketplace, speaker information and registration.",
            ],
            "hu": [
                "Egy tanulási platform teljes folyamata, az első kattintástól a megrendelés "
                "visszaigazolásáig, a fejlesztőkkel együtt dolgozva.",
                "Ugyanez a munka folytatódott a Swiss Re webinár platformján: belépés, "
                "piactér, előadói adatlapok és regisztráció.",
            ],
        },
        "shots": [
            ("img/campus.jpg", {"en": "Campus.swiss marketplace interface: recommended courses in a card layout.",
                                "hu": "Campus.swiss piactér felület: ajánlott képzések kártyás elrendezésben."}),
        ],
    },
]

NAV = {
    "en": [("work", "Work", "/work/"), ("about", "About", "/about/"), ("contact", "Contact", "/contact/")],
    "hu": [("work", "Munkák", "/hu/munkak/"), ("about", "Rólam", "/hu/rolam/"), ("contact", "Kapcsolat", "/hu/kapcsolat/")],
}

HOME = {"en": "/", "hu": "/hu/"}
WORK_INDEX = {"en": "/work/", "hu": "/hu/munkak/"}
PROJECT_BASE = {"en": "/work/", "hu": "/hu/munkak/"}

ABOUT_BODY = {
    "en": [
        "I am a graphic designer based in Budapest, specialising in visual identity, print "
        "and digital design. I earned my MA in Graphic Design from the Hungarian University "
        "of Fine Arts, and during my studies I was already working on real projects, in "
        "agency environments and on independent commissions alike.",
        "Early on I took smaller personal projects, usually visual identities and the printed "
        "material that came with them. That is where I got to know designing for print and "
        "creating marks, and it remains my preferred ground. In my second year at university "
        "I joined a cosmetics company, where I developed the design of the product range in "
        "line with the identity and designed the packaging for new products.",
        "Meanwhile a software development company brought me in as a UI designer. I learned "
        "Figma there and worked directly with developers for the first time, which is a "
        "perspective I still design with. I built interfaces for commercial, business "
        "optimisation and educational systems, for domestic and foreign companies alike.",
        "I currently work as a Senior Graphic Designer at an international company with "
        "Hungarian roots, where beyond the usual design work I take part in the company's "
        "global visual presence.",
    ],
    "hu": [
        "Grafikus és UX tervező vagyok Budapesten. Arculattal, nyomdai és digitális "
        "tervezéssel foglalkozom. A Magyar Képzőművészeti Egyetemen szereztem mesterdiplomát "
        "grafikusművész szakon, és már az egyetem alatt éles projekteken dolgoztam, "
        "ügynökségi környezetben és önálló megbízásokon egyaránt.",
        "A pálya elején kisebb személyes munkákat vittem, jellemzően arculatokat és a "
        "hozzájuk tartozó nyomdai anyagokat. Itt szerettem bele a nyomtatott felületbe és a "
        "jeltervezésbe, és ez máig a kedvenc terepem. Másodévesen kerültem egy kozmetikai "
        "céghez, ahol a termékcsalád arculati fejlesztése és az új termékek csomagolása volt "
        "a dolgom.",
        "Közben egy szoftverfejlesztő cég keresett meg felülettervezőnek. Ott tanultam meg a "
        "Figmát, és ott dolgoztam először közvetlenül programozókkal. Kereskedelmi, üzleti és "
        "oktatási rendszerekhez készítettem felületet, hazai és külföldi cégeknek egyaránt.",
        "Jelenleg senior grafikusként dolgozom egy magyar gyökerű nemzetközi cégnél, ahol a "
        "szokásos tervezői feladatok mellett a cég globális vizuális megjelenésében is részt "
        "veszek.",
    ],
}

CV = [
    ("2024 —", {"en": "Senior Graphic Designer, international company",
                "hu": "Senior grafikus, magyar gyökerű nemzetközi cég"}),
    ("2021—2023", {"en": "Medior Graphic Designer, production agency",
                   "hu": "Medior grafikus, produkciós ügynökség"}),
    ("2020—2021", {"en": "UI Designer, software development company",
                   "hu": "Felülettervező, szoftverfejlesztő cég"}),
    ("2019—2021", {"en": "Graphic Designer, cosmetics industry",
                   "hu": "Grafikus, kozmetikai ipar"}),
    ("2018 —", {"en": "Freelance commissions", "hu": "Önálló megbízások"}),
]

T = {
    "skip": {"en": "Skip to content", "hu": "Ugrás a tartalomra"},
    "back": {"en": "All work", "hu": "Összes munka"},
    "tools": {"en": "Illustrator, Photoshop, InDesign, Figma, Glyphs.",
              "hu": "Illustrator, Photoshop, InDesign, Figma, Glyphs."},
    "contact_lead": {"en": "Write a line about what you are working on. I answer within a day or two.",
                     "hu": "Írj egy sort arról, min dolgozol. Egy-két napon belül válaszolok."},
    "start": {"en": "Let us start", "hu": "Kezdjük el"},
    "footer_name": {"en": "József Gábos, Budapest", "hu": "Gábos József, Budapest"},
}

TITLES = {
    "work": {"en": "Work — gabos.co", "hu": "Munkák — gabos.co"},
    "about": {"en": "About — József Gábos, graphic and UI designer",
              "hu": "Rólam — Gábos József, grafikus és UX tervező"},
    "contact": {"en": "Contact — gabos.co", "hu": "Kapcsolat — gabos.co"},
}
DESCS = {
    "work": {"en": "Selected identity, packaging and interface work by József Gábos: Ratio Műhely, GHT-SYS, Alpok Water, Campus.swiss.",
             "hu": "Gábos József válogatott arculati, csomagolási és felülettervezési munkái: Ratio Műhely, GHT-SYS, Alpok Water, Campus.swiss."},
    "about": {"en": "József Gábos, graphic and UI designer in Budapest. MA from the Hungarian University of Fine Arts, working on identity, print and digital design since 2018.",
              "hu": "Gábos József grafikus és UX tervező Budapesten. Mesterdiploma a Magyar Képzőművészeti Egyetemen, arculat, print és digitális tervezés 2018 óta."},
    "contact": {"en": "Get in touch with József Gábos, graphic and UI designer based in Budapest. hello@gabos.co",
                "hu": "Vedd fel a kapcsolatot Gábos Józseffel, budapesti grafikus és UX tervezővel. hello@gabos.co"},
}

# ---------------------------------------------------------------- sablon


def head(lang, title, desc, path, depth):
    up = "../" * depth
    other = "hu" if lang == "en" else "en"
    alt = alt_path(path, lang)
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="color-scheme" content="light">
<link rel="canonical" href="{SITE}{path}">
<link rel="alternate" hreflang="{lang}" href="{SITE}{path}">
<link rel="alternate" hreflang="{other}" href="{SITE}{alt}">
<link rel="alternate" hreflang="x-default" href="{SITE}/">
<link rel="icon" href="{up}favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:url" content="{SITE}{path}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="{up}fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{up}assets/site.css">
</head>
<body class="sub">
<a class="skip" href="#main">{T['skip'][lang]}</a>
"""


def alt_path(path, lang):
    """A masik nyelv megfelelo utja."""
    pairs = [("/", "/hu/"), ("/work/", "/hu/munkak/"), ("/about/", "/hu/rolam/"),
             ("/contact/", "/hu/kapcsolat/")]
    for en, hu in pairs:
        if lang == "en" and path == en:
            return hu
        if lang == "hu" and path == hu:
            return en
    for p in PROJECTS:
        if lang == "en" and path == f"/work/{p['slug']['en']}/":
            return f"/hu/munkak/{p['slug']['hu']}/"
        if lang == "hu" and path == f"/hu/munkak/{p['slug']['hu']}/":
            return f"/work/{p['slug']['en']}/"
    return "/hu/" if lang == "en" else "/"


def masthead(lang, path):
    links = "".join(f'<a href="{url}">{label}</a>' for _, label, url in NAV[lang])
    other = "hu" if lang == "en" else "en"
    other_label = "Magyar" if lang == "en" else "English"
    return f"""<header class="pad submast">
  <a class="wordmark" href="{HOME[lang]}">gabos.co</a>
  <nav class="nav">{links}<a class="lang" href="{alt_path(path, lang)}" hreflang="{other}">{other_label}</a></nav>
</header>
"""


def footer(lang):
    return f"""<footer class="pad subfoot">
  <p class="muted">{T['footer_name'][lang]}</p>
  <p><a href="mailto:hello@gabos.co">hello@gabos.co</a></p>
</footer>
</body>
</html>
"""


def person_jsonld():
    return """<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Person","name":"József Gábos","alternateName":"Gábos József",
"jobTitle":"Graphic and UI designer","email":"mailto:hello@gabos.co","url":"https://gabos.co/",
"address":{"@type":"PostalAddress","addressLocality":"Budapest","addressCountry":"HU"},
"knowsAbout":["visual identity","packaging design","typography","print design","user interface design"],
"alumniOf":{"@type":"CollegeOrUniversity","name":"Hungarian University of Fine Arts"}}
</script>
"""


def write(path, html):
    full = os.path.join(ROOT, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w", encoding="utf-8").write(html)
    return path


# ---------------------------------------------------------------- oldalak


def build_work_index(lang):
    path = WORK_INDEX[lang]
    depth = path.strip("/").count("/") + 1
    up = "../" * depth
    rows = []
    for p in PROJECTS:
        url = f"{PROJECT_BASE[lang]}{p['slug'][lang]}/"
        rows.append(f"""  <li><a class="wrow" href="{url}">
    <span class="t">{p['title']}</span>
    <span class="k muted">{p['kind'][lang]}</span>
    <span class="y muted">{p['year']}</span>
  </a></li>""")
    body = f"""{masthead(lang, path)}
<main class="pad subwrap" id="main">
  <h1 class="subtitle">{'Work' if lang == 'en' else 'Munkák'}</h1>
  <ul class="worklist">
{chr(10).join(rows)}
  </ul>
</main>
{footer(lang)}"""
    return write(path, head(lang, TITLES['work'][lang], DESCS['work'][lang], path, depth) + body)


def build_project(lang, p):
    path = f"{PROJECT_BASE[lang]}{p['slug'][lang]}/"
    depth = path.strip("/").count("/") + 1
    up = "../" * depth
    shots = "".join(
        f'  <figure class="subshot"><img src="{up}{src}" alt="{alt[lang]}" loading="lazy" decoding="async"></figure>\n'
        for src, alt in p["shots"])
    paras = "".join(f"    <p>{t}</p>\n" for t in p["body"][lang])
    title = f"{p['title']} — {p['kind'][lang]} — gabos.co"
    desc = p["lead"][lang] + " " + p["body"][lang][0][:110]
    body = f"""{masthead(lang, path)}
<main class="pad subwrap" id="main">
  <p class="muted back"><a href="{WORK_INDEX[lang]}">← {T['back'][lang]}</a></p>
  <h1 class="subtitle">{p['title']}</h1>
  <p class="sublead">{p['lead'][lang]}</p>
  <div class="subbody">
    <p class="muted">{p['kind'][lang]} · {p['year']}</p>
{paras}  </div>
{shots}</main>
{footer(lang)}"""
    return write(path, head(lang, title, desc, path, depth) + body)


def build_about(lang):
    path = "/about/" if lang == "en" else "/hu/rolam/"
    depth = path.strip("/").count("/") + 1
    paras = "".join(f"    <p>{t}</p>\n" for t in ABOUT_BODY[lang])
    cv = "".join(f'    <li><span class="year">{y}</span><span>{d[lang]}</span></li>\n' for y, d in CV)
    body = f"""{masthead(lang, path)}
<main class="pad subwrap" id="main">
  <h1 class="subtitle">{'About' if lang == 'en' else 'Rólam'}</h1>
  <div class="subbody">
{paras}    <p class="muted">{T['tools'][lang]}</p>
  </div>
  <ul class="cv">
{cv}  </ul>
</main>
{footer(lang)}"""
    return write(path, head(lang, TITLES['about'][lang], DESCS['about'][lang], path, depth) + body + person_jsonld())


def build_contact(lang):
    path = "/contact/" if lang == "en" else "/hu/kapcsolat/"
    depth = path.strip("/").count("/") + 1
    body = f"""{masthead(lang, path)}
<main class="pad subwrap" id="main">
  <h1 class="subtitle">{'Contact' if lang == 'en' else 'Kapcsolat'}</h1>
  <p class="sublead">{T['contact_lead'][lang]}</p>
  <p><a class="mail" href="mailto:hello@gabos.co">hello@gabos.co</a></p>
  <p class="muted">Budapest, {'Hungary' if lang == 'en' else 'Magyarország'}</p>
</main>
{footer(lang)}"""
    return write(path, head(lang, TITLES['contact'][lang], DESCS['contact'][lang], path, depth) + body)


# ---------------------------------------------------------------- futtatas

if __name__ == "__main__":
    made = []
    for lang in ("en", "hu"):
        made.append(build_work_index(lang))
        for p in PROJECTS:
            made.append(build_project(lang, p))
        made.append(build_about(lang))
        made.append(build_contact(lang))

    # oldalterkep
    urls = ["/", "/hu/"] + made
    xml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in sorted(set(urls)):
        xml.append(f"  <url><loc>{SITE}{u}</loc></url>")
    xml.append("</urlset>")
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(xml) + "\n")

    open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")

    print(f"{len(made)} aloldal + sitemap.xml + robots.txt")
    for m in made:
        print("  ", m)
