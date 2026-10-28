"""Initial catalogue (sample data from the prototype).

Loaded once into an empty database by app.migrate. After that, Postgres is the
source of truth: edit products, prices and sets in the database, not here.
Products marked with real photos have files in static/images/products/.
"""
import json

import psycopg

ROOMS = [
    ("elutuba", "Elutuba", ["Diivan", "Vaip", "Riiul ja kapid", "Kõik suur mööbel"]),
    ("magamistuba", "Magamistuba", ["Voodi", "Öökapid", "Kardinad", "Kõik suur mööbel"]),
    ("kodukontor", "Kodukontor", ["Töölaud", "Tool", "Riiul", "Kõik suur mööbel"]),
    ("lastetuba", "Lastetuba", ["Voodi", "Hoiukastid", "Seinavärv", "Kõik suur mööbel"]),
    ("vannituba", "Vannituba", ["Valamukapp", "Peegel", "Plaadid", "Kõik on paigas"]),
]

# id, name, category, kind, colors, color_name, material, dims, price €, alternatives, tags
PRODUCTS = [
    ("OR-PK-101", "Sametpadjakate Sammal", "Padjakate", "cushion", ["#2F5A45", "#C9A55A", "#24463A"], "sügavroheline", "puuvillasamet", "50 × 50 cm", 35, ["OR-PK-102", "OR-PK-104"], ["roheline", "soe"]),
    ("OR-PK-102", "Linane padjakate Salvei", "Padjakate", "cushion", ["#9DB09A", "#E9E4D8", "#86997F"], "salvei", "pestud lina", "50 × 50 cm", 29, ["OR-PK-103", "OR-PK-101"], ["roheline", "rahulik", "hele"]),
    ("OR-PK-103", "Bouclé padjakate Kaer", "Padjakate", "cushion", ["#E4D9C6", "#CDBEA5", "#D6C9B3"], "kaer", "bouclé", "45 × 45 cm", 32, ["OR-PK-102", "OR-PK-101"], ["hele", "rahulik"]),
    ("OR-PK-104", "Sametpadjakate Öö", "Padjakate", "cushion", ["#1F1F1F", "#C9A55A", "#2E2E2E"], "must, kuldne ääris", "puuvillasamet", "50 × 50 cm", 36, ["OR-PK-101", "OR-PK-103"], ["mustkuld"]),
    ("OR-PK-105", "Sametpadjakate Pihlakas", "Padjakate", "cushion", ["#8E2F2C", "#C9A55A", "#7A2522"], "pihlakapunane", "puuvillasamet", "45 × 45 cm", 32, ["OR-PK-101", "OR-PK-104"], ["soe", "pidulik"]),
    ("OR-PL-201", "Villane pleed Kuusk", "Pleed", "throw", ["#2C5443", "#D9C9A3", "#21402F"], "kuuseroheline", "100% vill", "130 × 170 cm", 79, ["OR-PL-202", "OR-PL-203"], ["roheline", "soe"]),
    ("OR-PL-202", "Vahvelpleed Liiv", "Pleed", "throw", ["#D8C7A8", "#EFE6D6", "#C4B08E"], "liivabež", "puuvill", "130 × 180 cm", 49, ["OR-PL-201", "OR-PL-203"], ["hele", "rahulik"]),
    ("OR-PL-203", "Narmastega pleed Grafiit", "Pleed", "throw", ["#363636", "#C9A55A", "#262626"], "grafiit", "taaskasutatud vill", "140 × 180 cm", 59, ["OR-PL-201", "OR-PL-202"], ["mustkuld"]),
    ("OR-VA-301", "Džuudivaip Rand", "Vaip", "rug", ["#C2A77A", "#A88C5E", "#D6C29B"], "naturaalne", "džuut", "160 × 230 cm", 89, ["OR-VA-302", "OR-VA-303"], ["hele", "soe"]),
    ("OR-VA-302", "Madala narmaga vaip Kivi", "Vaip", "rug", ["#B9B3A8", "#8F897E", "#D2CCC1"], "kivihall", "taaskasutatud polüester", "160 × 230 cm", 69, ["OR-VA-301", "OR-VA-303"], ["hele", "rahulik"]),
    ("OR-VA-303", "Ümar vaip Metsalagendik", "Vaip", "rugr", ["#7FA387", "#F2E9D8", "#D9B76A"], "rohe-kreem", "puuvill", "Ø 120 cm", 69, ["OR-VA-302", "OR-VA-301"], ["roheline"]),
    ("OR-VL-401", "Põrandalamp Kuldne kaar", "Valgusti", "floorlamp", ["#EFE6D6", "#B08D4A", "#1E1E1E"], "must, messing", "metall, lina", "K 150 cm", 119, ["OR-VL-402"], ["mustkuld"]),
    ("OR-VL-402", "Põrandalamp Linane", "Valgusti", "floorlamp", ["#E6DCCB", "#8A6A44", "#6F5538"], "naturaalne", "tamm, lina", "K 145 cm", 95, ["OR-VL-401"], ["hele"]),
    ("OR-VL-403", "Keraamiline lauavalgusti Sammal", "Valgusti", "tablelamp", ["#EFE6D6", "#3E6250", "#2E4B3D"], "roheline", "keraamika, lina", "K 45 cm", 69, ["OR-VL-405", "OR-VL-404"], ["roheline"]),
    ("OR-VL-404", "Lauavalgusti Must kuld", "Valgusti", "tablelamp", ["#1E1E1E", "#B08D4A", "#B08D4A"], "must, messing", "metall", "K 42 cm", 79, ["OR-VL-403", "OR-VL-405"], ["mustkuld"]),
    ("OR-VL-405", "Lauavalgusti Kaer", "Valgusti", "tablelamp", ["#F3ECDF", "#D8CCB8", "#C9BBA3"], "kreem", "keraamika, lina", "K 40 cm", 59, ["OR-VL-403", "OR-VL-404"], ["hele", "rahulik"]),
    ("OR-VL-406", "Töölaualamp Kuusk", "Valgusti", "desklamp", ["#2C5443", "#B08D4A", "#2C5443"], "kuuseroheline", "metall", "K 48 cm", 65, ["OR-VL-405", "OR-VL-404"], ["roheline"]),
    ("OR-KT-501", "Kunstitrükk Sõnajalg", "Kunstitrükk", "art", ["#2F5A45", "#C9A55A", "#EDE6D8", "#8A6A44"], "roheline, kuldne", "paber, tammeraam", "50 × 70 cm", 75, ["OR-KT-502", "OR-KT-505"], ["roheline"]),
    ("OR-KT-502", "Kunstitrükk JOY", "Kunstitrükk", "art", ["#DDD7CC", "#1E1E1E", "#F3F0EA", "#1E1E1E"], "beež, must", "paber", "50 × 70 cm", 49, ["OR-KT-501", "OR-KT-503"], ["hele", "rahulik", "soe"]),
    ("OR-KT-503", "Kunstitrükk Kuldne joon", "Kunstitrükk", "art", ["#1E1E1E", "#C9A55A", "#F3ECDF", "#1E1E1E"], "must, kuldne", "paber, must raam", "50 × 70 cm", 55, ["OR-KT-501", "OR-KT-502"], ["mustkuld"]),
    ("OR-KT-504", "Kunstitrükk LIN", "Kunstitrükk", "art", ["#DDD7CC", "#2E3550", "#F3F0EA", "#1E1E1E"], "beež, tumesinine", "paber", "50 × 70 cm", 65, ["OR-KT-505", "OR-KT-502"], ["hele", "rahulik"]),
    ("OR-KT-505", "Kunstitrükk Metsahommik", "Kunstitrükk", "artwide", ["#3E6250", "#D9C9A3", "#EEE8DA", "#8A6A44"], "metsaroheline", "paber, tammeraam", "70 × 50 cm", 69, ["OR-KT-504", "OR-KT-501"], ["roheline"]),
    ("OR-KT-506", "Lastetrükid Rebane ja jänes, 2 tk", "Kunstitrükk", "art", ["#D9895B", "#7FA387", "#F2E9D8", "#E4D6BF"], "oranž, roheline", "paber, hele raam", "2 × 30 × 40 cm", 39, ["OR-KT-505", "OR-KT-502"], ["soe", "roheline"]),
    ("OR-VS-601", "Vaas Lehis", "Vaas", "vase", ["#3E6250", "#9DB09A", "#2E4B3D"], "roheline glasuur", "keraamika", "K 28 cm", 39, ["OR-VS-602", "OR-VS-603"], ["roheline"]),
    ("OR-VS-602", "Ribiline vaas Liiv", "Vaas", "vase", ["#C9B08A", "#9DB09A", "#B39A74"], "liivabež", "3D-prinditud", "K 26 cm", 29, ["OR-VS-601", "OR-VS-603"], ["hele", "rahulik"]),
    ("OR-VS-603", "Ribiline vaas Must", "Vaas", "vase", ["#1E1E1E", "#3A3A3A", "#2E2E2E"], "must", "3D-prinditud", "K 26 cm", 39, ["OR-VS-601", "OR-VS-602"], ["mustkuld"]),
    ("OR-DE-701", "Küünlajalad Messing, 3 tk", "Dekoratsioon", "candles", ["#B08D4A", "#F3ECDF", "#8A6A2E"], "messing", "messing", "K 12–24 cm", 32, ["OR-DE-702"], ["mustkuld", "soe"]),
    ("OR-DE-702", "Betoonalus küünaldega", "Dekoratsioon", "candles", ["#D8D0C4", "#F3ECDF", "#C4BBAE"], "kivihall, kreem", "betoon", "alus + 2 küünalt", 25, ["OR-DE-701"], ["hele", "rahulik"]),
    ("OR-DE-703", "Punutud korv Rukis", "Dekoratsioon", "basket", ["#C2A77A", "#8A6A44", "#A88C5E"], "naturaalne", "meriheinapunutis", "Ø 30 cm", 29, ["OR-DE-704"], ["hele", "soe"]),
    ("OR-DE-704", "Vildist korv Sammal", "Dekoratsioon", "basket", ["#3E6250", "#2C4A3A", "#4E7360"], "roheline", "vilt", "Ø 28 cm", 26, ["OR-DE-703"], ["roheline"]),
    ("OR-DE-705", "Paberist tähelamp Põhjanael", "Dekoratsioon", "star", ["#F3ECDF", "#C9A55A", "#E6DCC8"], "kreem", "paber", "Ø 45 cm", 34, [], ["pidulik"]),
    ("OR-DE-706", "Kuusepärg Talveöö", "Dekoratsioon", "wreath", ["#2C5443", "#B0413E", "#C9A55A"], "roheline, punane", "kunstkuusk", "Ø 40 cm", 45, [], ["pidulik"]),
    ("OR-VT-801", "Froteerätikud Salvei, 2 tk", "Vannitoa tekstiil", "towel", ["#9DB09A", "#EFE6D6", "#86997F"], "salvei", "puuvill", "50 × 90 cm", 39, ["OR-VT-802"], ["roheline"]),
    ("OR-VT-802", "Vahvelrätikud Kaer, 2 tk", "Vannitoa tekstiil", "towel", ["#E4D9C6", "#CDBEA5", "#D6C9B3"], "kaer", "puuvill", "50 × 90 cm", 34, ["OR-VT-801"], ["hele", "rahulik"]),
    ("OR-VT-803", "Vannitoamatt Sammal", "Vannitoa tekstiil", "mat", ["#3E6250", "#9DB09A", "#2E4B3D"], "roheline", "puuvill", "50 × 80 cm", 29, ["OR-VT-804"], ["roheline"]),
    ("OR-VT-804", "Vannitoamatt Kivi", "Vannitoa tekstiil", "mat", ["#B9B3A8", "#D2CCC1", "#A39D92"], "kivihall", "puuvill", "50 × 80 cm", 25, ["OR-VT-803"], ["hele", "rahulik"]),
    ("OR-VT-805", "Seebidosaatorid Kivi, 2 tk", "Vannitoa tarvik", "dispenser", ["#D8D2C6", "#B08D4A", "#C4BDAF"], "kivihall, messing", "keraamika", "K 17 cm", 36, ["OR-VT-806"], ["hele"]),
    ("OR-VT-806", "Seebidosaatorid Must, 2 tk", "Vannitoa tarvik", "dispenser", ["#1E1E1E", "#B08D4A", "#2E2E2E"], "must, messing", "klaas", "K 17 cm", 36, ["OR-VT-805"], ["mustkuld"]),
]

# Real product photos (product_id -> base file name in /images/products/).
# Each has "<base>-photo.webp" (white background) and "<base>-cutout.webp" (transparent).
REAL_IMAGES = {
    "OR-PK-101": "OR-PK-101",
    "OR-PK-105": "OR-PK-105",
    "OR-VS-602": "OR-VS-602",
    "OR-VS-603": "OR-VS-603",
    "OR-DE-702": "OR-DE-702",
    "OR-KT-502": "OR-KT-502",
    "OR-KT-504": "OR-KT-504",
}


def item(slot, product, kind, x, y, w):
    return (slot, product, kind, x, y, w)


# id, name, room, seasonal, moods, changes, discounts, summary, reason, items, lite variant
SETS = [
    ("roheline-tasakaal", "Roheline tasakaal", "elutuba", False, ["roheline", "soe"], ["hubasemaks", "varv"], [0.12, 0.06, 0.02],
     "Soojad tekstiilid ja sügavrohelised aktsendid muudavad sinu halli diivani ümbruse hubasemaks.",
     "Roheline samet ja kaerakarva bouclé toovad halli diivani juurde sooja kontrasti, villane pleed pehmendab diivani nurka ja sõnajalatrükk kordab rohelist seinal.",
     [item("padi1", "OR-PK-101", "cushion", 35, 43.5, 8.5), item("padi2", "OR-PK-103", "cushion", 44.5, 44.5, 8), item("pleed", "OR-PL-201", "throw", 68.5, 45, 7.5), item("kunst", "OR-KT-501", "art", 45, 11, 12), item("vaas", "OR-VS-601", "vase", 78.4, 49, 4.5)],
     {"swaps": {"pleed": "OR-PL-202", "kunst": "OR-KT-502"}, "removes": [], "note": "Kergem variant: villase pleedi asemel vahvelpleed ja sõnajalatrüki asemel trükk „JOY”."}),
    ("must-ja-kuld", "Must ja kuld", "elutuba", False, ["mustkuld"], ["isikupara", "hubasemaks"], [0.15, 0.08, 0.03],
     "Must samet, grafiit ja soe messing annavad elutoale õhtuse, isikupärase meeleolu.",
     "Kuldne kaarlamp loob diivani kõrvale pehme õhtuvalguse, must samet ja grafiitpleed annavad kontrasti ning messingdetailid kordavad samu kuldseid jooni.",
     [item("padi1", "OR-PK-104", "cushion", 36, 44, 8.5), item("pleed", "OR-PL-203", "throw", 68.5, 45, 7.5), item("lamp", "OR-VL-401", "floorlamp", 85, 34.5, 6.5), item("kunst", "OR-KT-503", "art", 45, 11, 12), item("kuunlad", "OR-DE-701", "candles", 77, 52.5, 7)],
     {"swaps": {"lamp": "OR-VL-402"}, "removes": [], "note": "Kergem variant: kuldse kaarlambi asemel linase varjuga põrandalamp."}),
    ("metsa-vaikus", "Metsa vaikus", "magamistuba", False, ["roheline", "hele"], ["rahulik", "hubasemaks"], [0.12, 0.06, 0.02],
     "Salvei, kaer ja metsaroheline teevad magamistoast vaikse ja puhanud ruumi.",
     "Hele lina ja vahvelpleed hoiavad voodi rahulikuna, roheline lauavalgusti ja metsatrükk lisavad tooni ilma ruumi koormamata.",
     [item("padi1", "OR-PK-102", "cushion", 37.5, 49, 8.5), item("padi2", "OR-PK-103", "cushion", 47, 50, 8), item("pleed", "OR-PL-202", "throwflat", 30, 63, 40), item("lamp", "OR-VL-403", "tablelamp", 22, 45, 6), item("kunst", "OR-KT-505", "artwide", 40, 10, 20)],
     {"swaps": {"lamp": "OR-VL-405", "kunst": "OR-KT-504"}, "removes": [], "note": "Kergem variant: heledam keraamiline lamp ja trükk „LIN”."}),
    ("kuldne-oo", "Kuldne öö", "magamistuba", False, ["mustkuld", "soe"], ["isikupara", "hubasemaks"], [0.15, 0.08, 0.03],
     "Sügav must ja soe messing muudavad magamistoa õhtuti hotellilikult hubaseks.",
     "Must samet ja grafiitpleed annavad heleda voodipesu juurde kontrasti, messinglamp ja kuldne trükk kordavad samu sooje jooni.",
     [item("padi1", "OR-PK-104", "cushion", 37.5, 49, 8.5), item("padi2", "OR-PK-103", "cushion", 47, 50, 8), item("pleed", "OR-PL-203", "throwflat", 30, 63, 40), item("lamp", "OR-VL-404", "tablelamp", 22, 45, 6), item("kunst", "OR-KT-503", "artwide", 40, 10, 20), item("vaas", "OR-VS-603", "vase", 72.9, 49.6, 4.2)],
     {"swaps": {"lamp": "OR-VL-405", "vaas": "OR-VS-602"}, "removes": [], "note": "Kergem variant: messinglambi asemel kreemjas keraamiline lamp ja heledam vaas."}),
    ("rahulik-toonurk", "Rahulik töönurk", "kodukontor", False, ["hele", "roheline"], ["rahulik"], [0.10, 0.05, 0.0],
     "Töönurk, kus pehme valgus, taimed ja looduslikud materjalid aitavad keskenduda.",
     "Suunatav lamp annab töölauale õige valguse, džuudivaip summutab heli ja heledates toonides trükk hoiab vaate rahulikuna.",
     [item("lamp", "OR-VL-406", "desklamp", 72, 39.4, 8), item("kunst", "OR-KT-502", "art", 50.9, 11, 12), item("vaas", "OR-VS-602", "vase", 38, 45.6, 4.2), item("vaip", "OR-VA-301", "rug", 33, 76, 40), item("padi", "OR-PK-102", "cushion", 45.4, 55, 6)],
     {"swaps": {"vaip": "OR-VA-302", "lamp": "OR-VL-405"}, "removes": [], "note": "Kergem variant: džuudivaiba asemel madala narmaga vaip ja lihtsam lamp."}),
    ("metsatukk", "Metsatukk", "lastetuba", False, ["roheline", "soe"], ["varv", "hubasemaks"], [0.10, 0.05, 0.0],
     "Metsa- ja rebasemotiivid ning pehme valgus loovad mängulise, kuid rahuliku nurga.",
     "Ümar vaip märgib mängukoha, lastetrükid toovad värvi seinale ja kreemjas lamp annab õhtuks pehme valguse.",
     [item("padi", "OR-PK-102", "cushion", 26, 50, 7.5), item("kunst", "OR-KT-506", "art", 25, 18, 10), item("lamp", "OR-VL-405", "tablelamp", 72.3, 42.3, 5.5), item("vaip", "OR-VA-303", "rugr", 38, 77, 30), item("korv", "OR-DE-704", "basket", 66, 64, 7.5)],
     {"swaps": {}, "removes": ["korv"], "note": "Kergem variant: ilma korvita – soodustus muutub hinnareegli järgi."}),
    ("spaa-kodus", "Spaa kodus", "vannituba", False, ["roheline", "hele"], ["rahulik"], [0.10, 0.05, 0.0],
     "Salvei ja kivi toonid ning messingdetailid toovad vannituppa spaa tunde.",
     "Salveirohelised tekstiilid pehmendavad plaatide jahedust, kivikarva dosaatorid ja punutud korv hoiavad tarvikud korras.",
     [item("ratikud", "OR-VT-801", "towel", 73, 31.5, 9), item("matt", "OR-VT-803", "mat", 40, 80, 22), item("dosaator", "OR-VT-805", "dispenser", 60, 39.3, 4), item("vaas", "OR-VS-602", "vase", 41, 40, 4), item("kunst", "OR-KT-504", "art", 14, 14, 9), item("korv", "OR-DE-703", "basket", 24, 65, 8)],
     {"swaps": {}, "removes": ["kunst"], "note": "Kergem variant: ilma seinapildita – soodustus muutub hinnareegli järgi."}),
    ("jouluohtu", "Jõuluõhtu", "elutuba", True, ["soe"], ["hubasemaks"], [0.12, 0.06, 0.0],
     "Samet, kuusepärg ja küünlavalgus toovad olemasolevasse elutuppa jõulumeeleolu.",
     "Pihlakapunane ja kuuseroheline samet sobivad halli diivaniga, tähelamp aknal ja küünlad annavad õhtuks sooja valguse.",
     [item("padi1", "OR-PK-105", "cushion", 35, 43.5, 8.5), item("padi2", "OR-PK-101", "cushion", 44.5, 44.5, 8), item("pleed", "OR-PL-201", "throw", 68.5, 45, 7.5), item("taht", "OR-DE-705", "star", 11.75, 18, 9), item("parg", "OR-DE-706", "wreath", 46, 12, 11), item("kuunlad", "OR-DE-701", "candles", 77, 52.5, 7)],
     {"swaps": {"pleed": "OR-PL-202"}, "removes": [], "note": "Kergem variant: villase pleedi asemel vahvelpleed."}),
]

def load(conn: psycopg.Connection) -> None:
    with conn.cursor() as cur:
        cur.executemany(
            "insert into rooms (id, name, keep_options, sort) values (%s, %s, %s, %s)",
            [(rid, name, keeps, n) for n, (rid, name, keeps) in enumerate(ROOMS)],
        )
        cur.executemany(
            "insert into products (id, name, category, kind, colors, color_name, material, dims, price_cents, tags)"
            " values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            [(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8] * 100, p[10]) for p in PRODUCTS],
        )
        cur.executemany(
            "insert into product_alternatives (product_id, alternative_id, sort) values (%s, %s, %s)",
            [(p[0], alt, n) for p in PRODUCTS for n, alt in enumerate(p[9])],
        )
        images = []
        names = {p[0]: p[1] for p in PRODUCTS}
        for pid, base in REAL_IMAGES.items():
            images.append((pid, "photo", f"/images/products/{base}-photo.webp", names[pid], 0))
            images.append((pid, "cutout", f"/images/products/{base}-cutout.webp", names[pid], 1))
        cur.executemany(
            "insert into product_images (product_id, role, url, alt, sort) values (%s, %s, %s, %s, %s)",
            images,
        )
        for n, s in enumerate(SETS):
            sid, name, room, seasonal, moods, changes, discounts, summary, reason, items, lite = s
            cur.execute(
                "insert into sets (id, name, room_id, seasonal, moods, changes, summary, reason, sort)"
                " values (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (sid, name, room, seasonal, moods, changes, summary, reason, n),
            )
            cur.executemany(
                "insert into set_items (set_id, slot, product_id, kind, pos_x, pos_y, width, sort)"
                " values (%s, %s, %s, %s, %s, %s, %s, %s)",
                [(sid, *it, k) for k, it in enumerate(items)],
            )
            cur.executemany(
                "insert into set_discounts (set_id, removed_count, rate) values (%s, %s, %s)",
                [(sid, k, rate) for k, rate in enumerate(discounts)],
            )
            cur.execute(
                "insert into set_variants (set_id, code, note, swaps, removes) values (%s, 'lite', %s, %s, %s)",
                (sid, lite["note"], json.dumps(lite["swaps"]), lite["removes"]),
            )
