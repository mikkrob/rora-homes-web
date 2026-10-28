// Drawn fallback illustrations: product art (for products without photos) and sample rooms.
// All strings here are static markup; only colour values from the catalogue are inserted,
// and those are validated as hex colours first.

const HEX = /^#[0-9a-fA-F]{3,8}$/;
const col = (c, fallback) => (HEX.test(c || '') ? c : fallback);

export const AR = {
  cushion: '1 / 1', throw: '100 / 110', throwflat: '320 / 100', rug: '320 / 100', rugr: '260 / 100',
  floorlamp: '100 / 350', tablelamp: '100 / 160', desklamp: '100 / 130', art: '100 / 125', artwide: '160 / 100',
  vase: '100 / 160', candles: '140 / 100', towel: '100 / 160', mat: '240 / 100', dispenser: '100 / 170',
  basket: '110 / 100', star: '1 / 1', wreath: '1 / 1',
};

const VIEWBOX = {
  cushion: '0 0 100 100', throw: '0 0 100 110', throwflat: '0 0 320 100', rug: '0 0 320 100', rugr: '0 0 260 100',
  floorlamp: '0 0 100 350', tablelamp: '0 0 100 160', desklamp: '0 0 100 130', art: '0 0 100 125', artwide: '0 0 160 100',
  vase: '0 0 100 160', candles: '0 0 140 100', towel: '0 0 100 160', mat: '0 0 240 100', dispenser: '0 0 100 170',
  basket: '0 0 110 100', star: '0 0 100 100', wreath: '0 0 100 100',
};

function shapes(kind, c1, c2, c3, c4) {
  switch (kind) {
    case 'throw': return `
<path d="M8 6 Q50 0 92 6 Q96 50 90 102 Q50 108 10 102 Q4 50 8 6Z" fill="${c1}"/>
<path d="M28 8 Q24 56 30 102 M54 6 Q58 56 52 104 M76 8 Q72 56 78 102" stroke="${c3}" stroke-width="3" fill="none" opacity="0.55"/>
<path d="M9 84 Q50 90 91 84" stroke="${c2}" stroke-width="5" fill="none"/>
<path d="M14 103v6M22 104v6M30 104v6M38 105v5M46 105v5M54 105v5M62 105v5M70 104v6M78 104v6M86 103v6" stroke="${c2}" stroke-width="2"/>`;
    case 'throwflat': return `
<path d="M18 8 H302 Q312 50 316 92 H4 Q8 50 18 8Z" fill="${c1}"/>
<path d="M60 8 Q56 50 52 92 M260 8 Q264 50 268 92" stroke="${c2}" stroke-width="6" fill="none"/>
<path d="M14 30 H306" stroke="${c3}" stroke-width="3" opacity="0.5"/>
<path d="M6 92 H314" stroke="${c3}" stroke-width="4"/>`;
    case 'rug': return `
<path d="M44 6 H276 L316 94 H4Z" fill="${c1}"/>
<path d="M58 16 H262 L294 84 H26Z" fill="none" stroke="${c2}" stroke-width="4"/>
<path d="M120 50 L160 30 L200 50 L160 70Z" fill="${c3}" opacity="0.85"/>
<path d="M66 50 H110 M210 50 H254" stroke="${c3}" stroke-width="4"/>`;
    case 'rugr': return `
<ellipse cx="130" cy="50" rx="126" ry="46" fill="${c1}"/>
<ellipse cx="130" cy="50" rx="100" ry="34" fill="none" stroke="${c2}" stroke-width="5"/>
<ellipse cx="130" cy="50" rx="52" ry="16" fill="${c3}"/>`;
    case 'floorlamp': return `
<ellipse cx="50" cy="140" rx="48" ry="64" fill="#FFE9B8" opacity="0.3"/>
<path d="M24 12 H76 L92 86 H8Z" fill="${c1}"/>
<path d="M24 12 H76" stroke="${c3}" stroke-width="3"/>
<path d="M50 86 V336" stroke="${c2}" stroke-width="5"/>
<ellipse cx="50" cy="340" rx="26" ry="6" fill="${c3}"/>`;
    case 'tablelamp': return `
<ellipse cx="50" cy="72" rx="46" ry="32" fill="#FFE9B8" opacity="0.32"/>
<path d="M26 8 H74 L88 62 H12Z" fill="${c1}"/>
<path d="M40 64 Q18 104 34 154 H66 Q82 104 60 64Z" fill="${c2}"/>
<path d="M42 82 Q32 108 40 140" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    case 'desklamp': return `
<ellipse cx="76" cy="70" rx="24" ry="14" fill="#FFE9B8" opacity="0.4"/>
<path d="M30 122 L22 66 L66 30" stroke="${c2}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="22" cy="66" r="4" fill="${c2}"/>
<path d="M56 18 L92 34 L80 54 Z" fill="${c1}"/>
<ellipse cx="32" cy="124" rx="26" ry="5" fill="${c1}"/>`;
    case 'art': return `
<rect width="100" height="125" fill="${c4}"/>
<rect x="5" y="5" width="90" height="115" fill="#F8F4EC"/>
<rect x="14" y="14" width="72" height="97" fill="${c3}"/>
<circle cx="62" cy="42" r="13" fill="${c2}"/>
<path d="M14 111 V78 Q34 54 52 76 Q68 60 86 72 V111Z" fill="${c1}"/>`;
    case 'artwide': return `
<rect width="160" height="100" fill="${c4}"/>
<rect x="5" y="5" width="150" height="90" fill="#F8F4EC"/>
<rect x="14" y="14" width="132" height="72" fill="${c3}"/>
<circle cx="108" cy="36" r="11" fill="${c2}"/>
<path d="M14 86 V62 Q40 44 68 60 Q96 42 146 58 V86Z" fill="${c1}"/>
<path d="M14 72 Q60 60 146 70" stroke="${c2}" stroke-width="2" fill="none" opacity="0.7"/>`;
    case 'vase': return `
<path d="M50 62 Q44 30 28 10 M50 62 Q56 26 74 8 M50 62 Q50 30 52 2" stroke="#5F6F52" stroke-width="2.2" fill="none"/>
<g fill="${c2}"><ellipse cx="30" cy="16" rx="7" ry="4" transform="rotate(-40 30 16)"/><ellipse cx="38" cy="30" rx="7" ry="4" transform="rotate(-30 38 30)"/><ellipse cx="70" cy="14" rx="7" ry="4" transform="rotate(35 70 14)"/><ellipse cx="62" cy="30" rx="7" ry="4" transform="rotate(30 62 30)"/><ellipse cx="51" cy="10" rx="4" ry="7"/></g>
<path d="M38 66 Q18 104 32 154 H68 Q82 104 62 66 Q58 60 62 54 H38 Q42 60 38 66Z" fill="${c1}"/>
<path d="M40 84 Q30 110 38 140" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    case 'candles': return `
<g fill="${c1}"><rect x="20" y="70" width="18" height="26"/><ellipse cx="29" cy="96" rx="14" ry="4"/><rect x="60" y="56" width="18" height="40"/><ellipse cx="69" cy="96" rx="14" ry="4"/><rect x="100" y="76" width="18" height="20"/><ellipse cx="109" cy="96" rx="14" ry="4"/></g>
<g fill="${c2}"><rect x="23" y="34" width="12" height="36"/><rect x="63" y="14" width="12" height="42"/><rect x="103" y="46" width="12" height="30"/></g>
<g fill="#F2C46D"><path d="M29 22 Q34 30 29 34 Q24 30 29 22Z"/><path d="M69 2 Q74 10 69 14 Q64 10 69 2Z"/><path d="M109 34 Q114 42 109 46 Q104 42 109 34Z"/></g>`;
    case 'towel': return `
<rect x="14" y="8" width="72" height="144" rx="6" fill="${c1}"/>
<rect x="26" y="8" width="56" height="98" rx="5" fill="${c3}" opacity="0.55"/>
<path d="M14 128 H86 M14 136 H86" stroke="${c2}" stroke-width="4"/>
<path d="M4 10 H96" stroke="#A98A52" stroke-width="5" stroke-linecap="round"/>`;
    case 'mat': return `
<path d="M30 8 H210 Q236 50 232 92 H8 Q4 50 30 8Z" fill="${c1}"/>
<path d="M40 24 H200 M30 42 H210 M22 60 H218 M16 78 H224" stroke="${c2}" stroke-width="4" opacity="0.7"/>`;
    case 'dispenser': return `
<rect x="8" y="60" width="38" height="106" rx="9" fill="${c1}"/><rect x="20" y="40" width="14" height="20" fill="${c2}"/>
<path d="M27 40 V30 H44" stroke="${c2}" stroke-width="5" fill="none"/>
<rect x="54" y="70" width="38" height="96" rx="9" fill="${c1}"/><rect x="66" y="52" width="14" height="18" fill="${c2}"/>
<path d="M73 52 V42 H90" stroke="${c2}" stroke-width="5" fill="none"/>`;
    case 'basket': return `
<path d="M10 22 H100 L90 96 H20Z" fill="${c1}"/>
<path d="M12 38 H98 M14 54 H96 M16 70 H94 M18 86 H92" stroke="${c2}" stroke-width="3" opacity="0.6"/>
<path d="M30 22 L34 96 M55 22 V96 M80 22 L76 96" stroke="${c3}" stroke-width="2" opacity="0.5"/>
<rect x="6" y="16" width="98" height="10" rx="4" fill="${c2}"/>`;
    case 'star': return `
<circle cx="50" cy="56" r="42" fill="#FFE9B8" opacity="0.35"/>
<path d="M50 0 V14" stroke="#7A6A4A" stroke-width="1.5"/>
<path d="M50 14 L58 41 L86 37 L65 56 L86 75 L58 71 L50 98 L42 71 L14 75 L35 56 L14 37 L42 41Z" fill="${c1}" stroke="${c2}" stroke-width="2"/>`;
    case 'wreath': return `
<circle cx="50" cy="54" r="34" fill="none" stroke="${c1}" stroke-width="18"/>
<circle cx="50" cy="54" r="34" fill="none" stroke="#1F3A2C" stroke-width="3" stroke-dasharray="4 7" opacity="0.6"/>
<g fill="${c2}"><circle cx="24" cy="40" r="4"/><circle cx="78" cy="42" r="4"/><circle cx="30" cy="78" r="4"/><circle cx="72" cy="80" r="4"/><circle cx="50" cy="88" r="4"/></g>
<path d="M50 20 L36 8 L38 24Z M50 20 L64 8 L62 24Z" fill="${c3}"/><circle cx="50" cy="20" r="4" fill="${c3}"/>`;
    default: return `
<path d="M10 16 Q50 6 90 16 Q98 50 90 86 Q50 96 10 86 Q2 50 10 16Z" fill="${c1}"/>
<path d="M10 16 Q50 6 90 16 Q98 50 90 86 Q50 96 10 86 Q2 50 10 16Z" fill="none" stroke="${c2}" stroke-width="2.4"/>
<path d="M22 28 Q50 20 78 28" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M20 74 Q50 80 80 74" stroke="${c3}" stroke-opacity="0.55" stroke-width="4" fill="none" stroke-linecap="round"/>
<circle cx="50" cy="51" r="3" fill="${c2}" opacity="0.8"/>`;
  }
}

/** Drawn product. `square` fits it into a square box (thumbnails). */
export function productArt(kind, colors, square = false) {
  const k = VIEWBOX[kind] ? kind : 'cushion';
  const c = colors || [];
  const c1 = col(c[0], '#2F5A45'), c2 = col(c[1], '#C9A55A'), c3 = col(c[2], c1), c4 = col(c[3], '#8A6A44');
  return `<div class="art" style="aspect-ratio:${square ? '1 / 1' : AR[k]}"><svg viewBox="${VIEWBOX[k]}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${shapes(k, c1, c2, c3, c4)}</svg></div>`;
}

const SCENES = {
  elutuba: `
<rect width="1600" height="720" fill="#E8E0D3"/><rect y="712" width="1600" height="12" fill="#D9CDBB"/><rect y="724" width="1600" height="276" fill="#C7AD89"/>
<path d="M0 790H1600M0 870H1600M0 950H1600M220 724V790M760 724V790M1300 724V790M480 790V870M1040 790V870M140 870V950M900 870V950M1420 870V950" stroke="#B99D77" stroke-width="2"/>
<path d="M160 724 L420 724 L700 1000 L260 1000Z" fill="#F3E6CC" opacity="0.45"/>
<rect x="104" y="114" width="312" height="472" fill="#F6F3EC"/><rect x="124" y="134" width="272" height="432" fill="#D5E0DA"/>
<path d="M124 134H396V300 Q260 260 124 330Z" fill="#E4ECE6"/><path d="M260 134V566M124 350H396" stroke="#F6F3EC" stroke-width="10"/>
<rect x="96" y="580" width="328" height="14" fill="#EFE9DE"/><rect x="40" y="84" width="420" height="8" rx="4" fill="#8A6A44"/>
<path d="M52 92 H124 Q114 400 136 712 H40 Q60 400 52 92Z" fill="#DDD3C3"/><path d="M78 100 Q72 400 86 708" stroke="#CFC3B0" stroke-width="4" fill="none"/>
<path d="M372 712 L388 618 H448 L464 712Z" fill="#CDBFA9"/>
<path d="M418 620 Q360 520 380 440 Q420 520 418 620Z M420 620 Q440 500 500 470 Q470 560 420 620Z M416 620 Q330 580 320 520 Q390 540 416 620Z" fill="#5E7B5E"/>
<path d="M422 620 Q430 420 450 380 Q470 480 422 620Z" fill="#6E8B6B"/>
<rect x="1400" y="250" width="170" height="10" fill="#B58A5C"/><rect x="1414" y="196" width="14" height="54" fill="#8F9D8A"/><rect x="1432" y="206" width="12" height="44" fill="#C9B79A"/><rect x="1448" y="190" width="16" height="60" fill="#5B6A60"/><circle cx="1530" cy="232" r="18" fill="#D8CDBA"/>
<ellipse cx="830" cy="728" rx="390" ry="16" fill="#000" opacity="0.08"/>
<rect x="520" y="404" width="620" height="180" rx="30" fill="#A5A7A2"/><rect x="474" y="478" width="96" height="226" rx="34" fill="#989A95"/><rect x="1090" y="478" width="96" height="226" rx="34" fill="#989A95"/>
<rect x="556" y="548" width="276" height="96" rx="20" fill="#B0B2AD"/><rect x="828" y="548" width="276" height="96" rx="20" fill="#ADAFAA"/><rect x="512" y="630" width="636" height="70" rx="14" fill="#90928D"/>
<rect x="540" y="700" width="14" height="24" fill="#5E4B37"/><rect x="1106" y="700" width="14" height="24" fill="#5E4B37"/>
<ellipse cx="1290" cy="602" rx="74" ry="14" fill="#7A6148"/><rect x="1283" y="604" width="14" height="106" fill="#6A533D"/><ellipse cx="1290" cy="712" rx="42" ry="8" fill="#6A533D"/>`,
  magamistuba: `
<rect width="1600" height="730" fill="#E3DCD1"/><rect y="722" width="1600" height="10" fill="#D6CBBB"/><rect y="732" width="1600" height="268" fill="#BFA17C"/>
<path d="M0 800H1600M0 880H1600M0 960H1600M300 732V800M900 732V800M1400 732V800M600 800V880M1200 800V880M200 880V960M1000 880V960" stroke="#B0916C" stroke-width="2"/>
<path d="M1250 732 L1520 732 L1380 1000 L900 1000Z" fill="#EFE0C4" opacity="0.4"/>
<rect x="1236" y="120" width="290" height="460" fill="#F5F2EB"/><rect x="1254" y="138" width="254" height="424" fill="#D6DDE0"/>
<path d="M1254 138H1508V290 Q1380 250 1254 320Z" fill="#E3E8EA"/><path d="M1381 138V562M1254 340H1508" stroke="#F5F2EB" stroke-width="10"/>
<rect x="1180" y="88" width="410" height="8" rx="4" fill="#8A6A44"/><path d="M1500 96 H1572 Q1562 400 1584 722 H1488 Q1508 400 1500 96Z" fill="#D9CFBF"/>
<rect x="520" y="320" width="560" height="280" rx="26" fill="#CDBFAA"/><path d="M613 334V590M706 334V590M800 334V590M893 334V590M986 334V590" stroke="#C2B39C" stroke-width="3"/>
<rect x="320" y="600" width="150" height="132" rx="6" fill="#9B7E5F"/><rect x="320" y="600" width="150" height="14" rx="4" fill="#AD9070"/><path d="M334 668H456" stroke="#876B4D" stroke-width="3"/>
<rect x="1130" y="600" width="150" height="132" rx="6" fill="#9B7E5F"/><rect x="1130" y="600" width="150" height="14" rx="4" fill="#AD9070"/><path d="M1144 668H1266" stroke="#876B4D" stroke-width="3"/>
<ellipse cx="800" cy="796" rx="350" ry="14" fill="#000" opacity="0.08"/>
<rect x="470" y="740" width="660" height="52" rx="10" fill="#B19D82"/><rect x="484" y="560" width="632" height="196" rx="22" fill="#F1EDE6"/>
<rect x="560" y="500" width="210" height="84" rx="28" fill="#FAF8F4"/><rect x="830" y="500" width="210" height="84" rx="28" fill="#FAF8F4"/>
<rect x="484" y="636" width="632" height="120" rx="18" fill="#E9E3D9"/><path d="M500 652 H1100" stroke="#DED6CA" stroke-width="3"/>`,
  kodukontor: `
<rect width="1600" height="740" fill="#E6E0D4"/><rect y="732" width="1600" height="10" fill="#D8CDBC"/><rect y="742" width="1600" height="258" fill="#BEA07A"/>
<path d="M0 810H1600M0 890H1600M0 970H1600M260 742V810M820 742V810M1380 742V810M540 810V890M1100 810V890M180 890V970M960 890V970" stroke="#AF916B" stroke-width="2"/>
<path d="M150 742 L410 742 L680 1000 L230 1000Z" fill="#F1E2C6" opacity="0.4"/>
<rect x="120" y="130" width="290" height="440" fill="#F5F2EB"/><rect x="138" y="148" width="254" height="404" fill="#D3DDD6"/>
<path d="M138 148H392V300 Q265 260 138 330Z" fill="#E2EAE4"/><path d="M265 148V552M138 350H392" stroke="#F5F2EB" stroke-width="10"/><rect x="110" y="566" width="310" height="14" fill="#EFE9DE"/>
<rect x="1310" y="300" width="230" height="12" fill="#B58A5C"/><rect x="1324" y="236" width="16" height="64" fill="#5B6A60"/><rect x="1344" y="248" width="14" height="52" fill="#C9B79A"/><rect x="1362" y="230" width="18" height="70" fill="#8F9D8A"/><rect x="1384" y="252" width="12" height="48" fill="#D8CDBA"/>
<path d="M1460 300 L1470 262 H1510 L1520 300Z" fill="#CDBFA9"/><path d="M1490 264 Q1470 230 1480 206 Q1500 236 1490 264Z M1492 264 Q1510 226 1530 220 Q1520 250 1492 264Z" fill="#5E7B5E"/>
<rect x="1310" y="420" width="230" height="12" fill="#B58A5C"/><rect x="1330" y="372" width="60" height="48" fill="#DCD3C3"/><rect x="1400" y="360" width="16" height="60" fill="#3F4A44"/><rect x="1420" y="368" width="14" height="52" fill="#B9A27E"/>
<ellipse cx="910" cy="796" rx="380" ry="14" fill="#000" opacity="0.08"/>
<rect x="836" y="488" width="160" height="64" rx="4" fill="#3B3F3D"/><rect x="846" y="496" width="140" height="48" fill="#5E6A66"/><path d="M816 552 H1016 L1006 560 H826Z" fill="#9A9D9B"/>
<rect x="560" y="556" width="700" height="24" rx="3" fill="#B58A5C"/><rect x="590" y="580" width="18" height="206" fill="#8A6A44"/><rect x="1212" y="580" width="18" height="206" fill="#8A6A44"/>
<rect x="1060" y="580" width="152" height="150" fill="#CDB896"/><path d="M1060 655H1212" stroke="#B9A27E" stroke-width="3"/><rect x="1120" y="610" width="32" height="6" rx="3" fill="#8A6A44"/><rect x="1120" y="685" width="32" height="6" rx="3" fill="#8A6A44"/>
<rect x="700" y="540" width="150" height="140" rx="22" fill="#6F7672"/><rect x="680" y="660" width="190" height="42" rx="14" fill="#7C837F"/><rect x="767" y="702" width="16" height="66" fill="#4E5350"/>
<path d="M705 778 H845" stroke="#4E5350" stroke-width="10" stroke-linecap="round"/>`,
  lastetuba: `
<rect width="1600" height="730" fill="#ECE3D4"/><path d="M200 730 V430 A280 280 0 0 1 760 430 V730Z" fill="#DCE3D6"/>
<rect y="722" width="1600" height="10" fill="#DDD1BF"/><rect y="732" width="1600" height="268" fill="#CDB28C"/>
<path d="M0 800H1600M0 880H1600M0 960H1600M340 732V800M940 732V800M1460 732V800M640 800V880M1240 800V880M120 880V960M1040 880V960" stroke="#BEA27B" stroke-width="2"/>
<rect x="1180" y="150" width="260" height="380" fill="#F5F2EB"/><rect x="1196" y="166" width="228" height="348" fill="#D6E0E3"/>
<path d="M1196 166H1424V290 Q1310 250 1196 320Z" fill="#E4EBED"/><path d="M1310 166V514M1196 340H1424" stroke="#F5F2EB" stroke-width="10"/>
<path d="M1220 640 L1440 640 L1520 1000 L1000 1000Z" fill="#F2E3C8" opacity="0.35"/>
<rect x="1040" y="560" width="320" height="172" rx="6" fill="#EFE7DA"/><path d="M1146 566V726M1252 566V726M1046 646H1354" stroke="#DCD0BD" stroke-width="5"/>
<rect x="1060" y="586" width="70" height="46" rx="4" fill="#D4C4AA"/><rect x="1270" y="664" width="70" height="52" rx="4" fill="#B9C8B5"/>
<ellipse cx="490" cy="740" rx="330" ry="12" fill="#000" opacity="0.07"/>
<rect x="170" y="610" width="640" height="120" rx="12" fill="#E2D3BA"/><rect x="190" y="566" width="600" height="64" rx="14" fill="#F7F3EC"/>
<rect x="210" y="522" width="160" height="66" rx="24" fill="#FBF9F5"/><rect x="380" y="566" width="410" height="96" rx="12" fill="#E7D9C2"/><path d="M400 600 H780" stroke="#DCCBB0" stroke-width="3"/>
<circle cx="900" cy="704" r="26" fill="#D9895B"/><path d="M884 690 L878 668 L894 682Z M916 690 L922 668 L906 682Z" fill="#D9895B"/>`,
  vannituba: `
<rect width="1600" height="380" fill="#EEE8DE"/><rect y="380" width="1600" height="380" fill="#DFE5DF"/>
<path d="M0 456H1600M0 532H1600M0 608H1600M0 684H1600M100 380V760M200 380V760M300 380V760M400 380V760M500 380V760M600 380V760M700 380V760M800 380V760M900 380V760M1000 380V760M1100 380V760M1200 380V760M1300 380V760M1400 380V760M1500 380V760" stroke="#D0D8D1" stroke-width="3"/>
<rect y="376" width="1600" height="8" fill="#D6CFC2"/><rect y="760" width="1600" height="240" fill="#CEC6B8"/>
<path d="M0 840H1600M0 920H1600M160 760V1000M480 760V1000M800 760V1000M1120 760V1000M1440 760V1000" stroke="#C0B8A9" stroke-width="2"/>
<circle cx="830" cy="270" r="140" fill="#DCE4E2" stroke="#A98A52" stroke-width="8"/><path d="M760 190 Q800 160 850 170" stroke="#FFF" stroke-opacity="0.6" stroke-width="10" fill="none" stroke-linecap="round"/>
<ellipse cx="830" cy="766" rx="230" ry="10" fill="#000" opacity="0.08"/>
<rect x="630" y="524" width="400" height="216" rx="6" fill="#B58A5C"/><path d="M830 534V730" stroke="#9C754C" stroke-width="3"/>
<rect x="800" y="610" width="6" height="40" rx="3" fill="#A98A52"/><rect x="854" y="610" width="6" height="40" rx="3" fill="#A98A52"/>
<rect x="610" y="500" width="440" height="26" rx="4" fill="#F3F0EA"/><ellipse cx="830" cy="500" rx="110" ry="14" fill="#FBFAF7" stroke="#E3DFD6" stroke-width="2"/>
<path d="M830 492 V462 H862" stroke="#A98A52" stroke-width="8" fill="none" stroke-linecap="round"/>
<path d="M1150 330 H1330" stroke="#A98A52" stroke-width="6" stroke-linecap="round"/><rect x="1148" y="320" width="8" height="22" rx="3" fill="#A98A52"/><rect x="1324" y="320" width="8" height="22" rx="3" fill="#A98A52"/>`,
};

const SCENE_LABEL = {
  elutuba: 'Näidistuba: elutuba halli diivaniga', magamistuba: 'Näidistuba: magamistuba heleda voodiga',
  kodukontor: 'Näidistuba: kodukontor töölauaga', lastetuba: 'Näidistuba: lastetuba madala voodiga',
  vannituba: 'Näidistuba: vannituba valamukapi ja peegliga',
};

export function roomScene(room) {
  const r = SCENES[room] ? room : 'elutuba';
  return `<svg class="scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${SCENE_LABEL[r]}">${SCENES[r]}</svg>`;
}
